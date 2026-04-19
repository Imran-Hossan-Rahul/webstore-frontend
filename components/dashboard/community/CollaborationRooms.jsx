"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Users,
  MessageCircle,
  Clock,
  CheckSquare,
  Hash,
  Lock,
  Globe,
  User as UserIcon,
  Calendar,
  Target
} from "lucide-react";

const RoomCard = ({ room, onRoomClick }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case "project":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "design":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "development":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "general":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div
      onClick={() => onRoomClick(room)}
      className="bg-white dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {room.isPublic ? (
              <Globe className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-orange-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {room.name}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {room.description}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(room.type)}`}>
          {room.type}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            <span>{room.creator?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.participants?.length || 0}/{room.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{room.messages?.length || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs">
            {formatDistanceToNow(new Date(room.lastActivity), { addSuffix: true })}
          </span>
        </div>
      </div>

      {room.relatedTask && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Target className="w-4 h-4" />
            <span>Task: {room.relatedTask.title}</span>
          </div>
        </div>
      )}

      {room.tags && room.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {room.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {room.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              +{room.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "general",
    isPublic: true,
    tags: "",
    maxParticipants: 50
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      const res = await api.post("/community/rooms", {
        ...formData,
        tags
      });

      if (res.success) {
        onRoomCreated(res.data);
        setFormData({
          name: "",
          description: "",
          type: "general",
          isPublic: true,
          tags: "",
          maxParticipants: 50
        });
        onClose();
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Collaboration Room
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Start a new collaboration space
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe the purpose of this room..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="project">Project</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                min="2"
                max="100"
                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="collaboration, design, react, etc."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Public Room (anyone can join)
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CollaborationRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);

      const res = await api.get(`/community/rooms?${params}`);
      if (res.success) {
        setRooms(res.data);
      } else {
        setError("Failed to load rooms");
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Error loading rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedType]);

  const handleRoomCreated = (newRoom) => {
    setRooms([newRoom, ...rooms]);
  };

  const handleRoomClick = (room) => {
    // TODO: Open room chat interface
  };

  return (
    <div className="min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Collaboration Rooms
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join or create spaces for focused collaboration
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/40 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="project">Project</option>
            <option value="design">Design</option>
            <option value="development">Development</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading rooms...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchRooms}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} onRoomClick={handleRoomClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No rooms yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to create a collaboration space!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Room
            </button>
          </div>
        )}
      </div>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
