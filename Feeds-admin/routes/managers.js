import express from "express";
import Admin from "../models/admin.js";

export const manager = express.Router();

manager.get("/list", async (req, res, next) => {
  try {
    const managers = await Admin.find({ role: "manager" }).select("-password");
    return res.status(200).json({
      success: true,
      managers,
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error fetching managers";
    return next(e);
  }
});

manager.post("/create", async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      const err = new Error("Username and password are required");
      err.statusCode = 400;
      return next(err);
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      const err = new Error("Username already exists");
      err.statusCode = 409;
      return next(err);
    }

    const created = await Admin.create({
      username,
      password,
      email,
      role: "manager",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      manager: {
        _id: created._id,
        username: created.username,
        email: created.email,
        role: created.role,
        status: created.status,
      },
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error creating manager";
    return next(e);
  }
});

manager.patch("/status/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      const err = new Error("Invalid status");
      err.statusCode = 400;
      return next(err);
    }

    const updated = await Admin.findOneAndUpdate(
      { _id: req.params.id, role: "manager" },
      { status },
      { new: true }
    ).select("-password");

    if (!updated) {
      const err = new Error("Manager not found");
      err.statusCode = 404;
      return next(err);
    }

    return res.status(200).json({
      success: true,
      manager: updated,
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error updating manager status";
    return next(e);
  }
});

manager.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Admin.findOneAndDelete({
      _id: req.params.id,
      role: "manager",
    });

    if (!deleted) {
      const err = new Error("Manager not found");
      err.statusCode = 404;
      return next(err);
    }

    return res.status(200).json({
      success: true,
      msg: "Manager removed",
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error deleting manager";
    return next(e);
  }
});
