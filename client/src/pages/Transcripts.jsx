import { useEffect, useState } from 'react';
import RecentJobsTable from '../components/RecentJobsTable.jsx';
import api from '../services/api';

export default function Transcripts() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/transcriptions")
      .then((res) => {
        if (res.data.success) {
          setTranscriptions(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load transcriptions:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <RecentJobsTable jobs={transcriptions} loading={loading} />
    </div>
  );
}
