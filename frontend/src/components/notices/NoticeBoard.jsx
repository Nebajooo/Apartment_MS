import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import NoticeForm from "./NoticeForm";

const NoticeBoard = () => {
  const { isAdmin } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notices");
      setNotices(response.data.notices || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
      alert("Failed to delete notice");
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center py-10">Loading notices...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notice Board</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingNotice(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + Post Notice
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <NoticeForm
            notice={editingNotice}
            onClose={() => {
              setShowForm(false);
              setEditingNotice(null);
            }}
            onSuccess={fetchNotices}
          />
        </div>
      )}

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No notices available
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={`card ${notice.is_pinned ? "border-l-4 border-blue-600" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {notice.is_pinned && "📌 "}
                    {notice.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted by {notice.posted_by_name || "Admin"} •{" "}
                    {new Date(notice.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                {notice.content}
              </p>
              {notice.expires_at && (
                <p className="mt-2 text-sm text-gray-400">
                  Expires: {new Date(notice.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
