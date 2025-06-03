// Required Modules
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { verifyAdmin } = require('./middleware/auth');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Admin=process.env.ADMIN;
const Admin_Password=process.env.ADMIN_PASSWORD;



// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Keep original extension
    }
});
const upload = multer({ storage: storage });

// Initialize app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://freelancer-platform-rho.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files


// === ROUTES ===

// Signup
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, country, role } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        const sql = 'INSERT INTO userss (first_name, last_name, email, password, country, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [firstName, lastName, email, hashedPassword, country, role], (err) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err.message });
            res.status(200).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error hashing password', error: err.message });
    }
});

// Signin
// Signin
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Admin login
    if (email === Admin && password === Admin_Password) {
        const token = jwt.sign(
            { role: 'Admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.json({
            message: 'Admin login successful',
            role: 'Admin',
            token: token,
            id: 'admin-id'
        });
    }

    // Regular user login
    const sql = 'SELECT * FROM userss WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Invalid email or password' });

        res.status(200).json({
            message: 'Login successful',
            role: user.role,
            id: user.id,
            username: user.first_name + ' ' + user.last_name,
            profilePic: user.profile_pic
        });
    });
});

// Protected Admin Route
app.get('/admin/data', verifyAdmin, (req, res) => {
    // Example admin data
    res.json({ 
        users: 150, 
        activeProjects: 45, 
        revenue: "$10,000" 
    });
});



// Post job
app.post('/post-job', (req, res) => {
    const { title, category, description, skills, budget, deadline, freelancer_id } = req.body;
    const sql = 'INSERT INTO jobs (title, category, description, skills, budget, deadline, freelancer_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [title, category, description, skills, budget, deadline, freelancer_id], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to post job', error: err.message });
        res.status(200).json({ message: 'Job posted successfully' });
    });
});



// Get jobs
app.get('/api/jobs', (req, res) => {
    const { freelancer_id, category, budget, time } = req.query;
    let sql = 'SELECT * FROM jobs WHERE status = 0';
    const values = [];

    if (freelancer_id) {
        sql += ' AND freelancer_id = ?';
        values.push(freelancer_id);
    }
    if (category) {
        sql += ' AND category = ?';
        values.push(category);
    }
    if (budget) {
        sql += ' AND budget <= ?';
        values.push(Number(budget));
    }
    if (time) {
        sql += ' AND deadline <= DATE_ADD(CURDATE(), INTERVAL ? WEEK)';
        values.push(Number(time));
    }

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(200).json(results);
    });
});

// fetch jobs client
app.get('/api/jobsClient', (req, res) => {
    const freelancerId = req.query.freelancer_id;
    const sql = 'SELECT * FROM jobs WHERE freelancer_id = ? AND status = 0';

    db.query(sql, [freelancerId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.status(200).json(results);
    });
});


// Get job title
app.get('/api/job-title/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    const sql = 'SELECT title FROM jobs WHERE id = ?';
    db.query(sql, [jobId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Job not found' });
        res.status(200).json(results[0]);
    });
});

// Get job applicants
app.get('/job_applications/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    const sql = `
        SELECT u.id as client_id, u.first_name, u.last_name, u.email
        FROM job_applications ja
        JOIN userss u ON ja.client_id = u.id
        WHERE ja.job_id = ?
    `;
    db.query(sql, [jobId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(200).json(results);
    });
});

// Hire client
app.post('/api/hire-client', (req, res) => {
    const { jobId, clientId, freelancerId } = req.body;
    
    const sql = `
        INSERT INTO ongoing_projects (job_id, freelancer_id, client_id, status)
        VALUES (?, ?, ?, 'in_progress');
        
        UPDATE jobs 
        SET status = 1 
        WHERE id = ?;  
    `;

    db.query(sql, 
        [jobId, freelancerId, clientId, jobId], // jobId used twice
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ 
                    message: 'Hiring failed. Either already hired or system error',
                    error: err.message 
                });
            }
            res.status(200).json({ message: 'Hiring successful' });
        }
    );
});


// Get freelancer ongoing projects
app.get('/api/freelancer/ongoing-projects', (req, res) => {
  const freelancer_id = req.query.freelancer_id;
  if (!freelancer_id) return res.status(400).json({ message: 'Freelancer ID required' });

  const sql = `
    SELECT 
    op.id AS ongoing_id,
    op.status,
    op.submitted_work,
    j.id AS job_id,
    j.title,
    CAST(j.budget AS FLOAT) AS budget,
    j.deadline,
    u.first_name AS freelancer_name,
    op.client_id
FROM ongoing_projects op
JOIN jobs j ON op.job_id = j.id
JOIN userss u ON op.freelancer_id = u.id
WHERE op.freelancer_id = ?
  AND op.payment_made = 0`;

  db.query(sql, [freelancer_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Get client ongoing projects
app.get('/api/client/ongoing-projects', (req, res) => {
  const client_id = req.query.client_id;
    if (!client_id) return res.status(400).json({ message: 'Client ID is required' });

    const sql = `
        SELECT 
            op.id AS ongoing_id,
            op.status,
            op.submitted_work,
            j.id AS job_id,
            j.title,
            CAST(j.budget AS FLOAT) AS budget,
            j.deadline,
            u.first_name AS freelancer_name
        FROM ongoing_projects op
        JOIN jobs j ON op.job_id = j.id
        JOIN userss u ON op.freelancer_id = u.id
        WHERE op.client_id = ?
        AND op.payment_made = 0
    `;

    db.query(sql, [client_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(200).json(results);
    });
});

// Submit work (file upload)
app.post('/api/submit-work/:projectId', upload.single('file'), (req, res) => {
    const projectId = req.params.projectId;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const sql = `
        UPDATE ongoing_projects
        SET submitted_work = ?, status = 'completed'
        WHERE id = ?
    `;

    db.query(sql, [file.filename, projectId], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to save file info', error: err.message });
        }
        res.status(200).json({ message: 'Work submitted and status updated to completed', filename: file.filename });
    });
});


// Update a job
app.put('/api/jobs/:id', (req, res) => {
    const jobId = req.params.id;
    const { title, category, description, skills, budget, deadline } = req.body;

    const sql = `
        UPDATE jobs
        SET title = ?, category = ?, description = ?, skills = ?, budget = ?, deadline = ?
        WHERE id = ?
    `;

    db.query(sql, [title, category, description, skills, budget, deadline, jobId], (err, result) => {
        if (err) {
            console.error("Error updating job:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ message: "Job updated successfully" });
    });
});

// Delete a job by ID
app.delete('/api/jobs/:id', (req, res) => {
    const jobId = req.params.id;

    // First delete related applications
    const deleteApplications = `DELETE FROM job_applications WHERE job_id = ?`;
    
    db.query(deleteApplications, [jobId], (appErr) => {
        if (appErr) {
            return res.status(500).json({ 
                message: 'Failed to delete related applications',
                error: appErr.message 
            });
        }

        // Then delete the job
        const deleteJob = `DELETE FROM jobs WHERE id = ?`;
        db.query(deleteJob, [jobId], (jobErr, result) => {
            if (jobErr) {
                console.error('Error deleting job:', jobErr.message);
                return res.status(500).json({ 
                    message: 'Failed to delete job',
                    error: jobErr.message 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Job not found' });
            }

            res.status(200).json({ message: 'Job deleted successfully' });
        });
    });
});


app.get('/applied-jobs/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    const sql = 'SELECT job_id FROM job_applications WHERE client_id = ?';
    db.query(sql, [clientId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        res.status(200).json(results);
    });
});

// Apply to a job
app.post('/api/apply', (req, res) => {
    const { client_id, job_id } = req.body;

    // Check if the application already exists
    const checkSql = 'SELECT * FROM job_applications WHERE client_id = ? AND job_id = ?';
    db.query(checkSql, [client_id, job_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });

        if (results.length > 0) {
            return res.status(409).json({ alreadyApplied: true, message: 'Already applied to this job' });
        }

        // Insert new application
        const applySql = 'INSERT INTO job_applications (client_id, job_id) VALUES (?, ?)';
        db.query(applySql, [client_id, job_id], (err) => {
            if (err) return res.status(500).json({ message: 'Failed to apply', error: err.message });
            res.status(200).json({ message: 'Application successful' });
        });
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Upload profile picture
app.post('/api/upload-profile-pic', upload.single('profilePic'), (req, res) => {
    try {
        const userId = req.body.userId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const filePath = `/uploads/${file.filename}`;
        const sql = 'UPDATE userss SET profile_pic = ? WHERE id = ?';
        
        db.query(sql, [filePath, userId], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    message: 'Failed to update profile picture',
                    error: err.message 
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Profile picture updated successfully',
                filename: file.filename,
                filePath: filePath
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: err.message 
        });
    }
});


app.post('/api/update-user-details', (req, res) => {
    const { userId, firstName, lastName, password } = req.body;

    const sql = 'UPDATE userss SET first_name = ?, last_name = ?, password = ? WHERE id = ?';
    db.query(sql, [firstName, lastName, password, userId], (err, result) => {
        if (err) {
            console.error("Error updating user details:", err.message);
            return res.status(500).json({ message: 'Failed to update user details', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User details updated successfully' });
    });
});



app.post('/api/insert-education-details', (req, res) => {
    const { freelancerId, shortBio, skills, degree, university, graduationYear } = req.body;

    if (!freelancerId || !shortBio || !skills || !degree || !university || !graduationYear) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const query = `
        INSERT INTO freelancer_details (freelancer_id, short_bio, skills, degree, university, graduation_year)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [freelancerId, shortBio, skills, degree, university, graduationYear];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error inserting details' });
        }
        res.json({ success: true, message: 'Details inserted successfully' });
    });
});


// Submit review route
app.post('/api/submit-review', (req, res) => {
    const { freelancer_id, client_id, job_id, rating, feedback } = req.body;

    // Ensure all fields are present
    if (!freelancer_id || !client_id || !job_id || !rating || !feedback) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if rating is within valid range
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const sql = 'INSERT INTO reviews (client_id,freelancer_id, job_id, rating, feedback) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [freelancer_id, client_id, job_id, rating, feedback], (err, result) => {
        if (err) {
            console.error('Error inserting review:', err);
            return res.status(500).json({ message: 'Failed to submit review', error: err.message });
        }

        res.status(200).json({ message: 'Review submitted successfully' });
    });
});

// Get freelancer details by ID
app.get('/api/freelancer-details/:clientId', (req, res) => {
    const freelancerId = req.params.clientId;

    const sql = `
        SELECT fd.*, u.first_name ,u.last_name
        FROM freelancer_details fd
        JOIN userss u ON fd.freelancer_id = u.id
        WHERE fd.freelancer_id = ?
    `;

    db.query(sql, [freelancerId], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                message: 'Database error',
                error: err.message 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                message: 'Freelancer details not found' 
            });
        }
        
        res.status(200).json(results[0]);
    });
});


// Get reviews for a freelancer along with client names
app.get('/api/freelancer-reviews/:clientId', (req, res) => {
    const freelancerId = req.params.clientId;

    const sql = `
        SELECT 
            r.rating,
            r.feedback,
            u.first_name,
            u.last_name
        FROM reviews r
        JOIN userss u ON r.client_id = u.id
        WHERE r.freelancer_id = ?
    `;

    db.query(sql, [freelancerId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Database error while fetching reviews',
                error: err.message,
            });
        }

        res.status(200).json(results);
    });
});

app.get('/admin/users', (req, res) => {
    const sql = 'SELECT id, first_name, last_name, email, country, role FROM userss';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ 
                message: 'Database error',
                error: err.message 
            });
        }
        res.status(200).json(results);
    });
});

app.get('/admin/clients', (req, res) => {
  const sql = `
    SELECT 
      id,
      CONCAT(first_name, ' ', last_name) AS name,
      email,
      country,
      role,
      created_at AS join_date,
      profile_pic
    FROM userss
    WHERE role = 'Client'
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.status(200).json(results);
  });
});

app.delete('/admin/clients/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM userss WHERE id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  });
});


app.get('/admin/freelancers', (req, res) => {
  const sql = `
    SELECT 
      id,
      CONCAT(first_name, ' ', last_name) AS name,
      country,
      email,
      profile_pic,
      created_at AS join_date
    FROM userss
    WHERE role = 'Freelancer'
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.status(200).json(results);
  });
});

// Delete a freelancer
app.delete('/admin/freelancers/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM userss WHERE id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json({ message: 'Freelancer deleted successfully' });
  });
});


app.get('/api/admin/ongoing-projects', (req, res) => {
  const sql = `
    SELECT 
  op.job_id,
  jobs.title AS job_title,
  op.status,
  op.created_at,
  CONCAT(client.first_name, ' ', client.last_name) AS client_name,
  CONCAT(freelancer.first_name, ' ', freelancer.last_name) AS freelancer_name
FROM ongoing_projects op
LEFT JOIN userss client ON op.client_id = client.id
LEFT JOIN userss freelancer ON op.freelancer_id = freelancer.id
LEFT JOIN jobs ON op.job_id = jobs.id
WHERE op.payment_made = 0
ORDER BY op.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        message: 'Error fetching ongoing projects',
        error: err.message 
      });
    }
    res.status(200).json(results);
  });
});


// Get completed projects admnn
// GET Completed Projects
app.get('/completed-projects', (req, res) => {
  const query = `
    SELECT 
      pd.job_id,
      j.title AS job_title,
      CONCAT(c.first_name, ' ', c.last_name) AS client_name,
      CONCAT(f.first_name, ' ', f.last_name) AS freelancer_name,
      pd.amount,
      pd.payment_date
    FROM payment_details pd
    JOIN jobs j ON pd.job_id = j.id
    JOIN userss c ON pd.client_id = c.id
    JOIN userss f ON pd.freelancer_id = f.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server Error' });
    }
    res.json(results);
  });
});


app.get('/api/freelancer/add-payment-details', (req, res) => {
  const freelancerId = req.query.freelancerId;

  if (!freelancerId) {
    return res.status(400).json({ message: 'Freelancer ID is required' });
  }

  // Step 1: Create a Stripe Express Account
  stripe.accounts.create({
    type: 'express',
    country: 'US', // or 'LK' for Sri Lanka
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true }
    }
  }).then(account => {
    const stripeAccountId = account.id;

    // Step 2: Save to DB
    const sql = `
      INSERT INTO freelancer_stripe_accounts (freelancer_id, stripe_account_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE stripe_account_id = VALUES(stripe_account_id)
    `;

    db.query(sql, [freelancerId, stripeAccountId], (err) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      // Step 3: Create onboarding link
      stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: 'http://localhost:3000/add-payment-details',
        return_url: 'http://localhost:3000/add-payment-details',
        type: 'account_onboarding'
      }).then(link => {
        res.status(200).json({ url: link.url });
      }).catch(err => {
        console.error('Stripe link error:', err);
        res.status(500).json({ message: 'Stripe link error', error: err.message });
      });
    });
  }).catch(err => {
    console.error('Stripe account error:', err);
    res.status(500).json({ message: 'Stripe account error', error: err.message });
  });
});

// Check if freelancer has connected Stripe
app.get('/api/freelancer/stripe-status', (req, res) => {
  const freelancerId = req.query.freelancerId;

  if (!freelancerId) {
    return res.status(400).json({ message: 'Freelancer ID is required' });
  }

  const sql = `SELECT stripe_account_id FROM freelancer_stripe_accounts WHERE freelancer_id = ?`;

  db.query(sql, [freelancerId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      return res.status(200).json({ stripe_account_id: null });
    }

    return res.status(200).json({ stripe_account_id: results[0].stripe_account_id });
  });
});


// GET /api/stripe-account/:freelancerId
// Assuming `db` is your MySQL connection pool supporting promises (e.g., mysql2)


app.get('/api/freelancer/stripe-account', (req, res) => {
  const freelancerId = req.query.freelancerId;

  if (!freelancerId) {
    return res.status(400).json({ message: 'Freelancer ID is required' });
  }

  const sql = `SELECT stripe_account_id FROM freelancer_stripe_accounts WHERE freelancer_id = ?`;

  db.query(sql, [freelancerId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      return res.status(200).json({ stripe_account_id: null });
    }

    return res.status(200).json({ stripe_account_id: results[0].stripe_account_id });
  });
});

app.post('/api/payout', async (req, res) => {
  const { freelancerId, amount } = req.body;

  if (!freelancerId || !amount) {
    return res.status(400).json({ error: 'Missing freelancerId or amount' });
  }

  try {
    const sql = 'SELECT stripe_account_id FROM freelancer_stripe_accounts WHERE freelancer_id = ?';
    db.query(sql, [freelancerId], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'Freelancer not found or DB error' });
      }

      const connectedAccountId = results[0].stripe_account_id;

      // ✅ Transfer from platform to freelancer (test mode, assumes platform balance has funds)
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // USD cents
        currency: 'usd',
        destination: connectedAccountId,
        description: `Payment to freelancer ID ${freelancerId}`,
      });

      res.json({ success: true, transfer });
    });
  } catch (err) {
    console.error('Stripe payout failed:', err);
    res.status(500).json({ error: 'Stripe payout failed', details: err.message });
  }
});

app.post('/create-payment-intent', async (req, res) => {
  const { amount, freelancerStripeId } = req.body;

  // Enhanced validation
  if (!freelancerStripeId?.startsWith('acct_')) {
    return res.status(400).send({ error: 'Invalid Stripe account format' });
  }

  if (!Number.isInteger(amount) || amount < 50) {
    return res.status(400).send({ 
      error: `Invalid amount (${amount}). Must be whole cents ≥ $0.50` 
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      payment_method_types: ['card'],
      application_fee_amount: Math.floor(amount * 0.1),
      transfer_data: {
        destination: freelancerStripeId,
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe Error:', err.raw || err);
    res.status(400).send({ 
      error: err.raw?.message || 'Payment processing failed' 
    });
  }
});

//save payment details
app.post('/api/save-payment-details', (req, res) => {
  const { job_id, freelancer_id, client_id, amount } = req.body;

  if (!job_id || !freelancer_id || !client_id || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // First insert payment details
  const insertSql = `
    INSERT INTO payment_details (job_id, freelancer_id, client_id, amount)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertSql, [job_id, freelancer_id, client_id, amount], (err, result) => {
    if (err) {
      console.error('Error saving payment:', err);
      return res.status(500).json({ error: 'Database error on insert' });
    }

    // Then update the ongoing_projects table
    const updateSql = `
      UPDATE ongoing_projects
      SET payment_made = 1
      WHERE job_id = ?
    `;

    db.query(updateSql, [job_id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating payment_made:', updateErr);
        return res.status(500).json({ error: 'Database error on update' });
      }

      res.status(200).json({ message: 'Payment details saved and project updated' });
    });
  });
});

app.get('/api/payments', (req, res) => {
  const clientId = req.query.client_id;

  const sql = `
    SELECT 
      p.job_id,
      j.title AS job_title,
      p.freelancer_id,
      CONCAT(u.first_name, ' ', u.last_name) AS freelancer_name,
      p.amount,
      p.payment_date
    FROM payment_details p
    JOIN jobs j ON p.job_id = j.id
    JOIN userss u ON p.freelancer_id = u.id
    WHERE p.client_id = ?
  `;

  db.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message
      });
    }
    res.json(results);
  });
});

// Get payments for freelancers
app.get('/api/paymentsfl', (req, res) => {
  const freelancer_id = req.query.freelancer_id;

  const sql = `
    SELECT 
      p.job_id,
      j.title AS job_title,
      p.client_id,
      CONCAT(u.first_name, ' ', u.last_name) AS client_name,
      p.amount,
      p.payment_date
    FROM payment_details p
    JOIN jobs j ON p.job_id = j.id
    JOIN userss u ON p.client_id = u.id
    WHERE p.freelancer_id = ?
  `;

  db.query(sql, [freelancer_id], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message
      });
    }
    res.json(results);
  });
});

