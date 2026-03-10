import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Recruit Flow AI HR System</h1>

      <p>Welcome to the autonomous recruitment platform.</p>

      <div style={{ marginTop: "20px" }}>
        <Link href="/chat">Go to Candidate Chat</Link>
      </div>

      <div style={{ marginTop: "10px" }}>
        <Link href="/calendar">Open Interview Calendar</Link>
      </div>

      <div style={{ marginTop: "10px" }}>
        <Link href="/dashboard">HR Dashboard</Link>
      </div>
    </div>
  );
}