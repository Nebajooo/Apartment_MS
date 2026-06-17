import { useState } from "react";
import api from "../../api/axios";

const NoticeForm = ({ onClose, onSuccess, notice }) => {
  const [formData, setFormData] = useState({
    title: notice?.title || "",
    content: notice?.content || "",
    isPinned: notice?.is_pinned || false,
    expiresAt: notice?.expires_at || "",
  });
  const [loading, setLoading] = useState(false);
  const isEditing = !!notice;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/notices/${notice.id}`, formData);
        alert("Notice updated successfully!");
      } else {
        await api.post("/notices", formData);
        alert("Notice posted successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">
        {isEditing ? "Edit Notice" : "Post New Notice"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Notice title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content *
          </label>
          <textarea
            name="content"
            required
            rows="4"
            value={formData.content}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="Write your notice here..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
              className="rounded"
            />
            <span className="text-sm">Pin this notice</span>
          </label>

          <label className="flex items-center space-x-2">
            <span className="text-sm">Expires:</span>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="border rounded px-2 py-1 text-sm"
            />
          </label>
        </div>

        <div className="flex space-x-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Notice"
                : "Post Notice"}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoticeForm;
