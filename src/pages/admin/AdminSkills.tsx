const AdminSkills = () => {
  return (
    <div className="admin-page-container">
      <h2 className="admin-page-title">Skills Management</h2>
      <div className="admin-list-header">
        <p style={{color: '#666'}}>Manage the skills shown in the 3D Tech Stack section.</p>
        <button className="admin-btn-add">+ Add Skill</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} style={{textAlign: 'center', color: '#999'}}>No skills added yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminSkills;
