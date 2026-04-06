import ResourcesList from "../components/resources/ResourcesList";
import ResourceUpload from "../components/resources/ResourceUpload";
import { useState } from "react";

export default function ResourcesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="resources-page">
      <h2>Resources</h2>
      <p>Upload and discover notes, repositories, code, and video resources in one place.</p>
      <ResourceUpload onUploaded={() => setRefreshKey((prev) => prev + 1)} />
      <ResourcesList refreshKey={refreshKey} />
    </div>
  );
}