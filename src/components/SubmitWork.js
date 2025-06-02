import React, { useState } from 'react';
import axios from 'axios';

const SubmitWork = ({ jobId }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_id", jobId);

    try {
      const res = await axios.post('http://localhost:5000/api/submit-work', formData);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("File upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.zip,.docx,.jpg,.png"
      />
      <button type="submit">Submit Work</button>
      <p>{message}</p>
    </form>
  );
};

export default SubmitWork;
