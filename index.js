const express = require("express");
const path = require("path") ;
const staticRouter = require("./routes/staticRouter") ;
const userRouter = require("./routes/user") ;
const blogRouter=require("./routes/main") ;
const faqRouter = require("./routes/faq") ;
const cookieparser = require("cookie-parser") ;
const {connectDBtoWeb} = require("./connection");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const methodOverride=require('method-override');
require('dotenv').config();
const app = express() ;
const PORT = 8000 ;
const Profile = require("./models/user");
const crypto = require("crypto") ;
const nodemailer = require("nodemailer") ;
const {verifyEmail} = require("./services/authenticate_mail") ;
const Question = require('./models/question_model');
const adminRouter = require("./routes/admin");
const queryRouter = require("./routes/query");
const Post = require("./models/post");
// const bcrypt = require("bcrypt") ;

// MongoDB conncection
connectDBtoWeb("mongodb://127.0.0.1:27017/Campus_Link_Website").then(()=>console.log("The Database is connected successfully")) ;

// views connections
app.set("view engine" , 'ejs') ;
app.set("views" , path.resolve('./views')) ;

//middlewares
app.use(express.static("public"));
app.use(express.json()) ;
app.use(express.urlencoded({extended:false})) ;
app.use(cookieparser()) ;
app.use(checkForAuthenticationCookie("token")) ;
app.use(methodOverride('_method'));

//routes
app.use("/", staticRouter) ;
app.use("/user", userRouter) ;
app.use("/main",blogRouter);
app.use("/faq", faqRouter) ;
app.use("/admin",adminRouter) ;
app.use("/query",queryRouter) ;

//Forgot password route


// app.get('/profile/:id', async (req, res) => {
//     try {
//         // Fetch user by ID from the database
//         const user = await Profile.findById(req.params.id);
        
//         // Check if user exists
//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         // Render the profile page and pass the user data to it
//         res.render('profile', {
//             user: user,         // Pass the user being viewed
//             date: Date.now(),   // Current date for time calculations
//             currentUser: req.user // Logged-in user for profile edit logic
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });

app.get("/ask", (req, res) => {
    // Make sure that `req.user` contains the logged-in user's data
    res.render("ask", {
        user: req.user
    });
});


app.post('/submit-question', async (req, res) => {
    const { title, question, userId } = req.body; // Grab all fields including userId
    //console.log(userId) ;
    //console.log(req.user.id) ;
    // if (req.user || req.user.id ) {
    //     return res.status(401).json({ message: 'Unauthorized: Invalid user' });
    // }

    // Proceed with saving the question
    const newQuestion = new Question({
        title,
        question,
        creator: req.user.id, // Set the creator to userId
        answered: false,
    });

    await newQuestion.save();

    // res.json({ message: 'Question asked successfully', question: newQuestion });
    res.redirect('/faq/');
});


app.get('/profile/:id', async (req, res) => {
    try {
        // Fetch user by ID from the database
        const user = await Profile.findById(req.params.id);
        
        // Check if user exists
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render the profile page and pass the user data to it
        // console.log(user) ;
        // console.log(req.user)
        res.render('profile', {
            userdata: user,         // Pass the user being viewed
            date: Date.now(),       // Current date for time calculations
            currentUser: req.user   // Logged-in user for profile edit logic
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// app.get('/profile/:id', async (req, res) => {
//     try {
//         // Fetch user by ID from the database
//         const user = await Profile.findById(req.params.id);
        
//         // Check if user exists
//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         // Fetch posts created by the user
//         const userPosts = await Post.find({ createdBy: user._id }).sort({ createdAt: -1 });

//         // Render the profile page with user data and their posts
//         res.render('profile', {
//             userdata: user,         // Pass the user being viewed
//             posts: userPosts,       // Pass user's posts
//             date: Date.now(),       // Current date for time calculations
//             currentUser: req.user   // Logged-in user for profile edit logic
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });

// app.get("/editprofile/:id", async (req, res) => {
//     try {
//         // Check if the user is logged in
//         if (req.session.username) {
//             // Fetch user by ID from the database
//             const user = await Profile.findById(req.params.id);

//             // Check if user exists and matches the logged-in user's username
//             if (user && req.session.username === user.fullname) {
//                 // Render the edit profile page with the user's data
//                 res.render("edit-profile", {
//                     username: req.session.username,
//                     email: req.session.email,
//                     userdata: user // Pass the user data to the template
//                 });
//             } else {
//                 // If user not found or doesn't match, render a not found page
//                 res.render("notfound");
//             }
//         } else {
//             // Redirect to home if not logged in
//             res.redirect("/");
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Server error");
//     }
// });

app.get('/editprofile/:id', async (req, res) => {
    try {
        // Fetch user by ID from the database
        const user = await Profile.findById(req.params.id);
        
        // Check if user exists
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render the edit profile page and pass the user data to it
        res.render('edit-profile', {
            userdata: user,         // Pass the user being edited
            currentUser: req.user   // Logged-in user for profile edit logic
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// app.post('/profile/update/:id', async (req, res) => {
//     try {
//         const { fullname, bio, weblink, phoneno,facebook,instagram,twitter,whatsapp } = req.body;
//         console.log(fullname);
//         console.log(phoneno);

//         // Update the user profile in the database
//         const updatedUser = await Profile.findByIdAndUpdate(req.params.id, {
//             fullname,
//             bio,
//             weblink,
//             facebook,
//             instagram,
//             twitter,
//             whatsapp,
//             phoneno
//         }, { new: true }); // Return the updated document
//         console.log(updatedUser) ;

//         // Redirect to the user's profile page after updating
//         res.redirect(`/profile/${updatedUser._id}`);

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });


// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Configure multer for file uploads

// app.post('/profile/update/:id', upload.single('image'), async (req, res) => {
//     try {
//         const { fullname, bio, weblink, fb, insta, tw, wa, phno } = req.body;

//         // Check if user exists
//         const user = await Profile.findById(req.params.id);
//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         // Update user profile details
//         user.fullname = fullname;
//         user.bio = bio;
//         user.weblink = weblink;
//         user.facebook = fb;
//         user.instagram = insta;
//         user.twitter = tw;
//         user.whatsapp = wa;
//         user.phoneno = phno;

//         // If an image file was uploaded, update profile picture URL
//         if (req.file) {
//             user.profileImageUrl = req.file.path; // Save file path to user profile (adjust accordingly)
//         }

//         await user.save();
//         res.redirect(`/profile/${user._id}`); // Redirect back to profile page after saving
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
      // console.log(file);
  
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

app.post('/profile/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { fullname, bio, weblink, fb, insta, tw, wa, phno } = req.body;

        // Create an update object for the fields to be updated
        const updateData = {
            fullname: fullname,
            bio: bio,
            weblink: weblink,
            facebook: fb,
            instagram: insta,
            twitter: tw,
            whatsapp: wa,
            phoneno: phno
        };

        // If an image file was uploaded, add the profile image path to the update object
        if (req.file) {
            updateData.profileImageURL = `/uploads/${req.file.filename}`; // Save the file URL path
        }

        // Use findByIdAndUpdate to update the user document
        const updatedUser = await Profile.findByIdAndUpdate(
            req.params.id,
            { $set: updateData }, // Set the new field values
            { new: true } // Return the updated document
        );

        // Check if the user exists
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        // Redirect back to the profile page after successful update
        res.redirect(`/profile/${updatedUser._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});





app.get('/forgot-password', (req, res) => {
    res.render('forgot-password'); // Ensure 'forgot-password.ejs' exists and is correctly located
  });
  
//   app.post('/forgot-password', async (req, res) => {
//     try {
//       const { email } = req.body;
  
//       // Check in both Profile (user) and Admin model
//       const user = await Profile.findOne({ email }) || await Admin.findOne({ email });
  
//       if (!user) {
//         return res.status(400).send('No account with that email address exists.');
//       }
  
//       // Generate a reset token
//       const token = crypto.randomBytes(20).toString('hex');
//       user.resetPasswordToken = token;
//       user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//       await user.save();
  
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true,
//         auth: {
//          user: process.env.OWNER_EMAIL,
//          pass: process.env.PASSWORD,
//         },
//        });
  
//       const mailOptions = {
//         to: email,
//         from: process.env.OWNER_EMAIL,
//         subject: 'Password Reset',
//         text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
//           Please click on the following link, or paste this into your browser to complete the process:\n\n
//           http://${req.headers.host}/reset-password/${token}\n\n
//           If you did not request this, please ignore this email and your password will remain unchanged.\n`
//       };
  
//       await transporter.sendMail(mailOptions);
//       res.send('An email has been sent with further instructions.');
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Error processing request.');
//     }
//   });

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Only check in Profile (user) model
        const user = await Profile.findOne({ email });
        // console.log(user) ;
        if (!user) {
            return res.status(400).send('No account with that email address exists.');
        }

        // Generate a reset token
        const token = crypto.randomBytes(20).toString('hex');
        // user.resetPasswordToken = token;
        // user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        // console.log("hello") ;
        // Save the user and handle errors
        // await user.save().catch(err => {
        //     console.error("Error saving user:", err);
        //     return res.status(500).send('Error saving user during password reset.');
        // });

        await Profile.updateOne(
            { _id: user._id },
            { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 }
          ).catch(err => {
            console.error("Error updating user:", err);
            return res.status(500).send('Error updating user during password reset.');
          });
          
        // console.log("hello") ;
        // Configure nodemailer to send the email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.OWNER_EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        // console.log(transporter) ;

        const mailOptions = {
            to: email,
            from: process.env.OWNER_EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        res.render('back_login');

    } catch (err) {
        console.error("Error in /forgot-password route:", err);
        res.status(500).send('Error processing request.');
    }
});

  
//   app.get('/reset-password/:token', async (req, res) => {
//     try {
//       const user = await Profile.findOne({
//         resetPasswordToken: req.params.token,
//         resetPasswordExpires: { $gt: Date.now() }
//       }) || await Admin.findOne({
//         resetPasswordToken: req.params.token,
//         resetPasswordExpires: { $gt: Date.now() }
//       });
  
//       if (!user) {
//         return res.status(400).send('Password reset token is invalid or has expired.');
//       }
  
//       res.render('reset-password', { token: req.params.token });
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Error rendering reset form.');
//     }
//   });

app.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await Profile.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        res.render('reset-password', { token: req.params.token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error rendering reset form.');
    }
});
  
//   app.post('/reset-password/:token', async (req, res) => {
//     try {
//       const { password } = req.body;
//       const user = await Profile.findOne({
//         resetPasswordToken: req.params.token,
//         resetPasswordExpires: { $gt: Date.now() }
//       }) || await Admin.findOne({
//         resetPasswordToken: req.params.token,
//         resetPasswordExpires: { $gt: Date.now() }
//       });
  
//       if (!user) {
//         return res.status(400).send('Password reset token is invalid or has expired.');
//       }
  
//       // Hash the new password before saving
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Update password and clear reset token
//       user.password = hashedPassword;
//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpires = undefined;
//       await user.save();
  
//       // Send confirmation email
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.OWNER_EMAIL,
//           pass: process.env.PASSWORD
//         }
//       });
  
//       const mailOptions = {
//         to: user.email,
//         from: process.env.OWNER_EMAIL,
//         subject: 'Password Reset Confirmation',
//         text: 'This is a confirmation that the password for your account has been changed.\n'
//       };
  
//       await transporter.sendMail(mailOptions);
//       res.send('Password has been successfully reset.');
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Error resetting password.');
//     }
//   });

// app.post('/reset-password/:token', async (req, res) => {
//     try {
//         const { password } = req.body;

//         // Find the user by the reset token
//         const user = await Profile.findOne({
//             resetPasswordToken: req.params.token,
//             resetPasswordExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).send('Password reset token is invalid or has expired.');
//         }

//         // Generate a new salt
//         const salt = crypto.randomBytes(16).toString('hex'); // Use hex encoding

//         // Hash the new password with the salt
//         const hashedPassword = crypto.createHmac("sha256", salt).update(password).digest("hex");

//         // Update the user's password, salt, and clear reset token
//         user.password = hashedPassword;
//         user.salt = salt;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;

//         // Save the updated user
//         await user.save();

//         // Send confirmation email
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.OWNER_EMAIL,
//                 pass: process.env.PASSWORD
//             }
//         });

//         const mailOptions = {
//             to: user.email,
//             from: process.env.OWNER_EMAIL,
//             subject: 'Password Reset Confirmation',
//             text: 'This is a confirmation that the password for your account has been changed.\n'
//         };

//         await transporter.sendMail(mailOptions);
//         res.send('Password has been successfully reset.');
//     } catch (err) {
//         console.error('Error resetting password:', err);
//         res.status(500).send('Error resetting password.');
//     }
// });

app.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;

        // Find the user by the reset token
        const user = await Profile.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        // Use the pre-save middleware to handle password hashing
        user.password = password; // This will trigger the 'pre' save hook for hashing
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Save the updated user with the new password
        await user.save();

        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.OWNER_EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            to: user.email,
            from: process.env.OWNER_EMAIL,
            subject: 'Password Reset Confirmation',
            text: 'This is a confirmation that the password for your account has been changed.\n'
        };

        await transporter.sendMail(mailOptions);
        res.render('back_to_login');
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).send('Error resetting password.');
    }
});

app.get("/verify-email/:id", verifyEmail);

/* Changes that Done*/

app.get("/users", async (req, res) => {
    try {
      const users = await Profile.find();
      res.render("power1", { users });
    } catch (err) {
      res.status(500).send("Error fetching users");
    }
});
app.post("/users/delete/:id", async (req, res) => {
    try {
      await Profile.findByIdAndDelete(req.params.id);
      res.redirect("/users");
    } catch (err) {
      res.status(500).send("Error deleting user");
    }
  });
  app.post("/users/promote/:id", async (req, res) => {
    try {
      await Profile.findByIdAndUpdate(req.params.id, { role: "IIITian" });
      res.redirect("/users");
    } catch (err) {
      res.status(500).send("Error promoting user to Admin");
    }
  });
  app.post("/users/block/:id", async (req, res) => {
    try {
      await Profile.findByIdAndUpdate(req.params.id, { isBlackListed: true }); // Use `true` as a boolean value
      res.redirect("/users");
    } catch (err) {
      res.status(500).send("Error blocklisting user");
    }
  });

  // Example in app.js or your routes file
app.get('/users/blocked', async(req, res) => {
    // Fetch blocked users from your database
    const blockedUsers = await Profile.find({ isBlackListed: true });
    //console.log(blockedUsers);
    res.render('power2', { users: blockedUsers });
  });

  app.post("/users/unblock/:id", async (req, res) => {
    try {
      await Profile.findByIdAndUpdate(req.params.id, { isBlackListed: false }); // Use `true` as a boolean value
      res.redirect("/users/blocked");
    } catch (err) {
      res.status(500).send("Error blocklisting user");
    }
  });


// PORT Started
app.listen(PORT , ()=>console.log("Server is started successfully")) ;