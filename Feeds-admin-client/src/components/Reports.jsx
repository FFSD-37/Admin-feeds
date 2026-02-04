import React, { useState, useEffect, useContext } from "react";
import { AlertTriangle, User, FileText, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/dashboard.css";
import Sidebar from "./Sidebar";
import "../styles/reports.css";

const ReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { setIsAuthenticated, user } = useContext(AuthContext);
//   let statusCounts;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:8080/report/list", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.success) {
          setReports(data.reports);
        } else {
          alert("Error fetching reports");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (dateObj) => {
    if (!dateObj) return "N/A";
    const date = dateObj.$date ? new Date(dateObj.$date) : new Date(dateObj);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
      reviewed: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
      resolved: { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
      dismissed: { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" },
    };
    return colors[status?.toLowerCase()] || colors["pending"];
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8080/report/updateReportStatus`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReports(
          reports.map((report) =>
            report._id === reportId ? { ...report, status: newStatus } : report,
          ),
        );
        setSelectedReport((prev) =>
          prev?._id === reportId ? { ...prev, status: newStatus } : prev,
        );
      } else {
        alert("Error updating report status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredReports =
    filterStatus === "all"
      ? reports
      : reports.filter(
          (report) => report.status.toLowerCase() === filterStatus,
        );

  const statusCounts = {
    all: reports.length,
    pending: reports.filter((r) => r.status?.toLowerCase() === "pending")
      .length,
    reviewed: reports.filter((r) => r.status?.toLowerCase() === "reviewed")
      .length,
    resolved: reports.filter((r) => r.status?.toLowerCase() === "resolved")
      .length,
    dismissed: reports.filter((r) => r.status?.toLowerCase() === "dismissed")
      .length,
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <div className="header-right">
            <div className="user-info">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bonnie"
                alt="User"
                className="user-avatar"
              />
              <span className="user-name">{user.username}</span>
            </div>
          </div>
        </div>
        <div className="content-area">
          <div className="header">
            <h2 className="pageTitle">User Reports</h2>
            <div className="stats">
              <span className="statBadge">Total: {reports.length}</span>
              <span className="statBadge pendingBadge">
                Pending: {statusCounts.pending}
              </span>
            </div>
          </div>
          <div className="filterTabs">
            <button
              className={`filterTab ${filterStatus === "all" ? "filterTabActive" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              <Filter size={16} />
              All ({statusCounts.all})
            </button>
            <button
              className={`filterTab ${filterStatus === "pending" ? "filterTabActive" : ""}`}
              onClick={() => setFilterStatus("pending")}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              className={`filterTab ${filterStatus === "reviewed" ? "filterTabActive" : ""}`}
              onClick={() => setFilterStatus("reviewed")}
            >
              Reviewed ({statusCounts.reviewed})
            </button>
            <button
              className={`filterTab ${filterStatus === "resolved" ? "filterTabActive" : ""}`}
              onClick={() => setFilterStatus("resolved")}
            >
              Resolved ({statusCounts.resolved})
            </button>
            <button
              className={`filterTab ${filterStatus === "dismissed" ? "filterTabActive" : ""}`}
              onClick={() => setFilterStatus("dismissed")}
            >
              Dismissed ({statusCounts.dismissed})
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="emptyState">
              <AlertTriangle size={48} color="#9ca3af" />
              <p className="emptyText">No reports found</p>
            </div>
          ) : (
            <div className="reportList">
              {filteredReports.map((report) => {
                const statusStyle = getStatusColor(report.status);
                return (
                  <div
                    key={report._id || report.report_number}
                    className="reportCard"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="cardHeader">
                      <div className="reportNumber">
                        <AlertTriangle size={18} color="#ef4444" />
                        <span>Report #{report.report_number}</span>
                      </div>
                      <div
                        className="statusBadge"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      >
                        {report.status}
                      </div>
                    </div>

                    <div className="cardBody">
                      <div className="infoRow">
                        <FileText size={16} color="#6b7280" />
                        <div className="infoContent">
                          <span className="infoLabel">Post ID:</span>
                          <span className="infoValue">{report.post_id}</span>
                        </div>
                      </div>

                      <div className="infoRow">
                        <User size={16} color="#6b7280" />
                        <div className="infoContent">
                          <span className="infoLabel">Reported User:</span>
                          <span className="infoValue">
                            {report.user_reported}
                          </span>
                        </div>
                      </div>

                      <div className="reasonContainer">
                        <span className="reasonLabel">Reason:</span>
                        <p className="reasonText">
                          {report.reason?.length > 100
                            ? `${report.reason.substring(0, 100)}...`
                            : report.reason}
                        </p>
                      </div>
                    </div>

                    <div className="cardFooter">
                      <div className="dateInfo">
                        <Calendar size={14} color="#6b7280" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      <button
                        className="viewButton"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal for detailed view */}
      {selectedReport && (
        <div className="modalOverlay" onClick={() => setSelectedReport(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3 className="modalTitle">
                Report Details - #{selectedReport.report_number}
              </h3>
              <button
                className="closeButton"
                onClick={() => setSelectedReport(null)}
              >
                ✕
              </button>
            </div>
            <div className="modalBody">
              <div className="modalRow">
                <span className="modalLabel">Post ID:</span>
                <span className="modalValue">{selectedReport.post_id}</span>
              </div>
              <div className="modalRow">
                <span className="modalLabel">Reported User:</span>
                <span className="modalValue">
                  {selectedReport.user_reported}
                </span>
              </div>
              <div className="modalRow">
                <span className="modalLabel">Status:</span>
                <div className="statusActions">
                  <select
                    value={selectedReport.status}
                    onChange={(e) =>
                      handleStatusChange(selectedReport._id, e.target.value)
                    }
                    className="statusSelect"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>
                </div>
              </div>
              <div className="modalRow">
                <span className="modalLabel">Report Number:</span>
                <span className="modalValue">
                  #{selectedReport.report_number}
                </span>
              </div>
              <div className="modalRow">
                <span className="modalLabel">Created:</span>
                <span className="modalValue">
                  {formatDate(selectedReport.createdAt)}
                </span>
              </div>
              <div className="modalRow">
                <span className="modalLabel">Updated:</span>
                <span className="modalValue">
                  {formatDate(selectedReport.updatedAt)}
                </span>
              </div>
              <div className="modalMessageSection">
                <span className="modalLabel">Reason:</span>
                <p className="modalMessage">{selectedReport.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
