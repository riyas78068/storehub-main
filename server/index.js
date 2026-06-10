const express = require("express")
const {PrismaClient} = require("@prisma/client")
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'SUPER_ADMIN_SECRET';

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  jwt.verify(token, 'sd-rooms', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
    }
    req.user = decoded;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: admin only' });
  }
  next();
};

app.get("/", (req, res) => {
  const data = prisma.login.findMany();
  res.status(200).json({message: "Welcome to the API", data});
});
app.get("/register", (req, res) => {
  const data = prisma.login.findMany()
  res.status(200).json({message: "Register endpoint",  data});
});
app.post("/register",async (req, res) => {
 

  //data from front end
  const data = req.body;

  //DB logic
  const emailexit = await prisma.login.findUnique({
    where: { 
      email: data.email,
    }
  })
  if(emailexit){
    res.status(400).json({message: "Email already exists"});
  }
  else{
    const hash = await bcrypt.hash(data.password, 10);
    const role = data.adminKey === ADMIN_SECRET ? 'admin' : 'user';

    const updatedata = await prisma.login.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
        role,
      }
    }); 
     const {password, ...datas} = updatedata;
    res.status(201).json({message: "User created successfully", data: datas });
  }

});


//POSt methode for login
app.post("/login", async (req, res) => {
  const data = req.body;   

  const emailexit = await prisma.login.findUnique({
    where: { 
      email: data.email,
    }
  });

  if (!emailexit) {
    res.status(400).json({message: "Invalid email or password"});
  } else {
    const isMatch = await bcrypt.compare(data.password, emailexit.password);
    const {password, ...datas} = emailexit;
    if (!isMatch) {
      res.status(400).json({message: "Invalid email or password"});
    } else {
      const userRole = emailexit.role || 'user';
      const temp_key = jwt.sign({ user_id: emailexit.user_id, email: emailexit.email, role: userRole }, 'sd-rooms',{
        expiresIn: '15m'
      });
      const main_key = jwt.sign({ user_id: emailexit.user_id, email: emailexit.email, role: userRole }, 'sd-main',{ 
        expiresIn: '7d'
      });
      const datass = {
        token: {
          temp_key,
          main_key
        },
        ...datas
      };
       
      res.status(200).json({message: "Login successful", data: datass});
    }
  }
});

app.post("/refresh", (req, res) => {
  const data = req.body;
  try { 
    jwt.verify(data.main_key, 'sd-main', (err, decoded) => {
      if (err) {
        return res.status(401).json({message: "Invalid main token", error: err.message});
      }
      const temp_key = jwt.sign({ user_id: decoded.user_id, email: decoded.email, role: decoded.role || 'user' }, 'sd-rooms', { expiresIn: '15m' });
      res.status(200).json({message: "Token refreshed successfully", data: temp_key });
    });
  } catch (error) {
    res.status(401).json({message: "Invalid token", error: error.message});
  }
});
//GET methode for all products
app.get("/products", async (req, res) => {
  try {
    const data = await prisma.card.findMany();
    res.status(200).json({message: "Products fetched successfully", data});
  } catch (error) {
    res.status(500).json({message: "Error fetching products", error: error.message});
  }
});

//GET methode for single product
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.card.findUnique({
      where: { product_id: id }
    });
    if (!data) {
      return res.status(404).json({message: "Product not found"});
    }
    res.status(200).json({message: "Product fetched successfully", data});
  } catch (error) {
    res.status(500).json({message: "Error fetching product", error: error.message});
  }
});

//POST methode for admin - Create product
app.post("/admin", authenticateToken, authorizeAdmin, async(req,res)=>{
  try {
    const data = req.body;

    const newdata = await prisma.card.create({
      data:{
        product_name : data.product_name,
        product_image : data.product_image,
        product_discription : data.product_discription,
        product_rating : data.product_rating,
        product_brand : data.product_brand,
        price : data.price,
      }
    });
    res.status(201).json({message: "Product created successfully", data:newdata });
  } catch (error) {
    res.status(500).json({message: "Error creating product", error: error.message});
  }
});

//PUT methode for admin - Update product
app.put("/admin/:id", authenticateToken, authorizeAdmin, async(req,res)=>{
  try {
    const { id } = req.params;
    const data = req.body;

    const updateddata = await prisma.card.update({
      where: { product_id: id },
      data:{
        product_name : data.product_name,
        product_image : data.product_image,
        product_discription : data.product_discription,
        product_rating : data.product_rating,
        product_brand : data.product_brand,
        price : data.price,
      }
    });
    res.status(200).json({message: "Product updated successfully", data:updateddata });
  } catch (error) {
    res.status(500).json({message: "Error updating product", error: error.message});
  }
});

//DELETE methode for admin - Delete product
app.delete("/admin/:id", authenticateToken, authorizeAdmin, async(req,res)=>{
  try {
    const { id } = req.params;
    
    const deleteddata = await prisma.card.delete({
      where: { product_id: id }
    });
    res.status(200).json({message: "Product deleted successfully", data:deleteddata });
  } catch (error) {
    res.status(500).json({message: "Error deleting product", error: error.message});
  }
});

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

