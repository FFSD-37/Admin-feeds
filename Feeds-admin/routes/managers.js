import express from "express";
import Admin from "../models/admin.js";
import ManagerAction from "../models/managerAction.js";

export const manager = express.Router();
const VALID_MANAGER_TYPES = ["user", "channel", "kids", "revenue"];

manager.get("/list", async (req, res, next) => {
  try {
    const managers = await Admin.find({ role: "manager" }).select("-password");
    const stats = await ManagerAction.aggregate([
      {
        $group: {
          _id: "$managerId",
          totalActions: { $sum: 1 },
          resolvedTickets: {
            $sum: {
              $cond: [{ $eq: ["$actionType", "report_resolved"] }, 1, 0],
            },
          },
          postsRemoved: {
            $sum: {
              $cond: [{ $eq: ["$actionType", "post_removed"] }, 1, 0],
            },
          },
          lastActionAt: { $max: "$createdAt" },
        },
      },
    ]);

    const statsByManager = new Map(
      stats.map((s) => [String(s._id), s])
    );

    const enriched = managers.map((m) => {
      const s = statsByManager.get(String(m._id));
      return {
        ...m.toObject(),
        performance: {
          totalActions: s?.totalActions || 0,
          resolvedTickets: s?.resolvedTickets || 0,
          postsRemoved: s?.postsRemoved || 0,
          lastActionAt: s?.lastActionAt || null,
        },
      };
    });

    return res.status(200).json({
      success: true,
      managers: enriched,
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error fetching managers";
    return next(e);
  }
});

manager.get("/performance/:id", async (req, res, next) => {
  try {
    const managerUser = await Admin.findOne({
      _id: req.params.id,
      role: "manager",
    }).select("-password");

    if (!managerUser) {
      const err = new Error("Manager not found");
      err.statusCode = 404;
      return next(err);
    }

    const [summary] = await ManagerAction.aggregate([
      { $match: { managerId: managerUser._id } },
      {
        $group: {
          _id: "$managerId",
          totalActions: { $sum: 1 },
          resolvedTickets: {
            $sum: {
              $cond: [{ $eq: ["$actionType", "report_resolved"] }, 1, 0],
            },
          },
          postsRemoved: {
            $sum: {
              $cond: [{ $eq: ["$actionType", "post_removed"] }, 1, 0],
            },
          },
          lastActionAt: { $max: "$createdAt" },
        },
      },
    ]);

    const actions = await ManagerAction.find({ managerId: managerUser._id })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json({
      success: true,
      manager: managerUser,
      summary: {
        totalActions: summary?.totalActions || 0,
        resolvedTickets: summary?.resolvedTickets || 0,
        postsRemoved: summary?.postsRemoved || 0,
        lastActionAt: summary?.lastActionAt || null,
      },
      actions,
    });
  } catch (e) {
    e.statusCode = 500;
    e.message = "Error fetching manager performance";
    return next(e);
  }
});

manager.post("/create", async (req, res, next) => {
  try {
    const { username, password, email, managerType } = req.body;
    if (!username || !password) {
      const err = new Error("Username and password are required");
      err.statusCode = 400;
      return next(err);
    }

    if (!VALID_MANAGER_TYPES.includes(managerType)) {
      const err = new Error(
        "managerType is required and must be one of: user, channel, kids, revenue"
      );
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
      managerType,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      manager: {
        _id: created._id,
        username: created.username,
        email: created.email,
        role: created.role,
        managerType: created.managerType,
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

manager.patch("/type/:id", async (req, res, next) => {
  try {
    const { managerType } = req.body;
    if (!VALID_MANAGER_TYPES.includes(managerType)) {
      const err = new Error(
        "Invalid managerType. Allowed: user, channel, kids, revenue"
      );
      err.statusCode = 400;
      return next(err);
    }

    const updated = await Admin.findOneAndUpdate(
      { _id: req.params.id, role: "manager" },
      { managerType },
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
    e.message = "Error updating manager type";
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
