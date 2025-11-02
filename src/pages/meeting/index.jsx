import React from 'react';

function Meeting() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Meeting Management</h1>
            <p>Welcome to the meeting management page. Here you can view and manage all your meetings.</p>
            
            <div style={{ marginTop: '20px' }}>
                <h2>Upcoming Meetings</h2>
                <ul>
                    <li>Team Sync - 10:00 AM, 12th Oct</li>
                    <li>Project Review - 2:00 PM, 14th Oct</li>
                    <li>Client Meeting - 11:00 AM, 16th Oct</li>
                </ul>
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <button style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Schedule New Meeting
                </button>
            </div>
        </div>
    );
}

export default Meeting;