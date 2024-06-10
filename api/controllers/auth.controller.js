import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';


export const register = async (req, res) => {
    const { username, email, password } = req.body;
    // Hash the password
    try {
      const hashPassword = await bcrypt.hash(password, 10);
      // console.log(hashPassword);
      // Create a new User and save it to DB
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashPassword,
        },
      });
      console.log(newUser);

      res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to create a User!" });
    }
}

export const login = async (req, res) => {
    const {username, password} = req.body;
    
    try {
        const existUser = await prisma.user.findUnique({
            where: {username}
        })
        // Check if the user exists
        if(!existUser) return res.status(401).json({ message: "Invalid Credentials!" });
         // Check the password is correct
        const isPasswordValid = await bcrypt.compare(password, existUser.password);
        if(!isPasswordValid) return res.status(401).json({ message: "Invalid Credentials!" });

        // Generate a cookie token and send it to the User
        // res.setHeader("Set-Cookie", "test=" + "myValue").json("success!");
        
        const age = 1000 * 60 * 60 *24 * 7;

        const token = jwt.sign({
            id: existUser.id
        }, process.env.JWT_SECRET_KEY, 
          { expiresIn: age }  
        );

        

        res.cookie("toekn", token, {
            httpOnly: true,
            // secure: true // for Production make sure to uncomment this 
            maxAge: age,
        }).status(200).json({ message: "Login Successful" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to login!" })
    }
}

export const logout= (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logout Successful!" });
}