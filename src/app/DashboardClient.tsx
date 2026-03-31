"use client";

import { useState } from "react";
import NewProjectModal from "@/components/NewProjectModal";

export default function DashboardClient() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        + New Project
      </button>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </>
  );
}
