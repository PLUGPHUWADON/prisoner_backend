const express = require("express");
const app = express();
const Sequelize = require('sequelize');
const session = require('express-session');
require('dotenv').config();

//set environment variables
const port = process.env.PORT || 5000;

//set project
// app.set("views",path.join(__dirname,"/public/views"));
// app.set('view engine', 'ejs');
// app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({secret:"mysession",resave:false,saveUninitialized:false}));

//set file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/images');
//     },
//     filename: function (req, file, cb) {
//       cb(null,Date.now() + file.originalname);
//     }
// });
// const upload = multer({ storage: storage });

//set database
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: './database/prisoncooperative.sqlite'
});
const user = sequelize.define("user",{
    userid:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username:{
        type: Sequelize.STRING
    },
    phone:{
        type: Sequelize.STRING
    },
    email:{
        type: Sequelize.STRING
    },
    password:{
        type: Sequelize.STRING
    },
    role:{
        type: Sequelize.STRING,
        defaultValue: 'user'
    }
});
const product = sequelize.define("product",{
    productid:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    productname:{
        type: Sequelize.STRING
    },
    productcategory:{
        type: Sequelize.STRING
    },
    productprice:{
        type: Sequelize.STRING
    },
    imgurl:{
        type: Sequelize.STRING
    }
});
const cart = sequelize.define("cart",{
    cartid:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userid:{
        type: Sequelize.INTEGER
    },
    cartuser:{
        type: Sequelize.STRING
    }
});
const order = sequelize.define("order",{
    orderid:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userid:{
        type: Sequelize.INTEGER
    },
    cartuser:{
        type: Sequelize.STRING
    },
    prisoner:{
        type: Sequelize.STRING
    }
});
const prisoner = sequelize.define("prisoner",{
    prisonerid:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    prisonername:{
        type: Sequelize.STRING
    }
});
sequelize.sync();

//rounting system

app.get("/",(req,res) => {
    res.render("login.ejs");
});

app.post("/login", (req,res) => {
    let checkpass = false;
    user.findAll().then(data => {
        data.forEach(e => {
            if (req.body.phone == e.dataValues.phone && req.body.password == e.dataValues.password) {
                checkpass = true;
                req.session.userlogin = e.dataValues.userid;
                console.log(req.session.userlogin);
                // res all data and statuslogin
                res.json({statuslogin:true, data:e.dataValues});
            }
        });
        if (checkpass == false) {
            res.json({statuslogin:false});
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.post("/createuser",(req,res) => {
    let checksame = false;
    user.findAll().then(data => {
        if (data) {
            for (let i = 0 ; i < data.length ; i++) {
                if (req.body.phone == data[i].dataValues.phone) {
                    checksame = true;
                }
            }
            if (!checksame) {
                user.create(req.body).then(data => {
                    res.json(data);
                }).catch(err => {
                    res.status(500).send(err);
                });
            }
            else{
                res.json({registerfailed:true});
            }
        }
        else{
            res.status(404).send("user not found");
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

// get user by id
app.get("/getuser/:id",(req,res) => {
    user.findByPk(req.params.id).then(data => {
        if (data) {
            res.json(data);
        }
        else{
            res.status(404).send("user not found");
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.put("/updateuser/:id",(req,res) => {
    let checksame = false;
    user.findByPk(req.params.id).then(data => {
        if (data) {
            user.findAll().then(dataall => {
                if (dataall) {
                    for (let i = 0 ; i < dataall.length ; i++) {
                        // if phone is same
                        if (req.body.phone == dataall[i].dataValues.phone && req.body.phone != data.dataValues.phone) {
                            checksame = true;
                        }
                    }
                    
                    console.log("same",  checksame);
                    if (!checksame) {
                        data.update(req.body).then(() => {
                            console.log("1");
                            res.json(data);
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    }
                    else{
                        res.json({updatefailed:true});
                    }
                }
                else{
                    res.status(404).send("user not found");
                }
            }).catch(err => {
                res.status(500).send(err);
            });
        }
        else{
            res.status(404).send("user not found");
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.post("/forgotpassword",(req,res) => {
    let username = req.body.username;
    let phone = req.body.phone;
    let checkforgot = false;

    user.findAll().then(data => {
        awaitfn();
        async function awaitfn() {
            await new Promise((resolve,reject) => {
                for (let i = 0 ; i < data.length ; i++) {
                    if (data[i].dataValues.username == username && data[i].dataValues.phone == phone) {
                        checkforgot = true;
                        user.findOne({where:{username:username,phone:phone}}).then(data2 => {
                            res.json({checkforgot:true,userid:data2.dataValues.userid});
                            resolve();
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    }
                }
                if (checkforgot == false) {
                    resolve();
                }
            });
            await new Promise((resolve,reject) => {
                console.log("t")
                if (checkforgot == false) {
                    console.log("t")
                    res.json({checkforgot:false});
                }
                resolve();
            });
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.delete("/deleteuser/:id",(req,res) => {
    user.findByPk(req.params.id).then(data => {
        if (data) {
            data.destroy().then(() => {
                res.json({});
            }).catch(err => {
                res.status(500).send(err);
            })
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get("/getallproduct",(req,res) => {
    product.findAll().then(data => {
        if (data) {
            res.json(data);
        }
        else{
            res.status(404).send("products not found");
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get("/getproductbyid/:id",(req,res) => {
    product.findByPk(req.params.id).then(data => {
        if (data) {
            res.json(data);
        }
        else{
            res.status(404).send("product not found");
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get("/getproduct/:productcategory",(req,res) => {
    console.log(req.params.productcategory);
    product.findAll({where:{productcategory:req.params.productcategory}}).then(data => {
        if (data) {
            res.json(data);
        }
        else{
            res.status(404).send("products not found");
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.post("/createproduct",(req,res) => {
    product.create({
        productname:req.body.productname,
        productcategory:req.body.productcategory,
        productprice:req.body.productprice,
        imgurl:req.body.imgurl
    }).then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.put("/updateproduct/:id",(req,res) => {
    product.findByPk(req.params.id).then(data => {
        if (data) {
            data.update(req.body).then(() => {
                res.json(data);
            }).catch(err => {
                res.status(500).send(err);
                console.log(err);
            });
        }
        else{
            res.status(404).send("product not found");
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.delete("/deleteproduct/:id",(req,res) => {
    product.findByPk(req.params.id).then(data => {
        if (data) {
            data.destroy().then(() => {
                res.json({});
            }).catch(err => {
                res.status(500).send(err);
            });
        }
        else{
            res.status(404).send('product not found');
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.post("/addcart/:id",(req,res) => { // input by form html
    console.log(req.params.id);
    cart.findOrCreate({ 
        where:{userid:req.body.userid},
        defaults:{userid:req.body.userid}}).then(data => {
            if (data) {
                cart.findOne({where:{userid:req.body.userid}}).then(data1 => {
                    if (data1) {
                        product.findByPk(req.params.id).then(data2 => {
                            if (data2) {
                                let checksame = false;
                                let index = 0;
                                let cartuser = [];

                                try{
                                    for (let i = 0 ; i < JSON.parse(data1.dataValues.cartuser).length ; i++) {
                                        cartuser.push({id:JSON.parse(data1.dataValues.cartuser)[i].id,amount:JSON.parse(data1.dataValues.cartuser)[i].amount});
                                    }
                                    for (let i = 0 ; i < cartuser.length ; i++) {
                                        if (req.params.id == cartuser[i].id) {
                                            checksame = true;
                                            index = i;
                                        }
                                    }
                                    if (checksame) {
                                        cartuser[index] = ({id:req.params.id,amount:req.body.amountproduct});
                                    }
                                    else{
                                        cartuser.push({id:req.params.id,amount:req.body.amountproduct});
                                    }

                                    data1.update({cartuser:JSON.stringify(cartuser)}).then(() => {
                                        res.json({});
                                    }).catch(err => {
                                        res.status(500).send(err);
                                    });
                                }catch{
                                    if (checksame == false) {
                                        cartuser.push({id:req.params.id,amount:req.body.amountproduct});
                                    }
                                    data1.update({cartuser:JSON.stringify(cartuser)}).then(() => {
                                        res.json({});
                                    }).catch(err => {
                                        res.status(500).send(err);
                                    });
                                }
                            }
                            else{
                                res.status(404).send("product not found");
                            }
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    }
                    else{
                        res.status(404).send("order not found");
                    }
                }).catch(err => {
                    res.status(500).send(err);
                });
            }
     }).catch(err => {
        res.status(500).send(err);
     });
});

// //** method
app.post("/deletecart/:userid/:id",(req,res) => {
    cart.findOne({where:{userid:req.params.userid}}).then(data => {
        if (data) {
            let product = JSON.parse(data.dataValues.cartuser);
            product.splice(product.findIndex(e => e.id == req.params.id),1);
            data.update({cartuser:JSON.stringify(product)}).then(() => {
                res.json({});
            }).catch(err => {
                res.status(500).send(err);
            });
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.post("/addorder/:userid",(req,res) => {
    cart.findOne({where:{userid:req.params.userid}}).then(data => {
        if (data) {
            order.create({
                userid:req.params.userid,
                cartuser:data.dataValues.cartuser,
                prisoner:req.body.prisonername}).then(() => {
                data.destroy().then(() => {
                    res.json({});
                }).catch(err => {
                    res.status(500).send(err);
                });
            }).catch(err => {
                res.status(500).send(err);
            });
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get("/getallorder",(req,res) => {
    order.findAll().then(data => {
        if (data) {
           res.json(data);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get("/getorderuser/:id",(req,res) => {
    order.findAll({where:{userid:req.params.id}}).then(data => {
        if (data) {
            res.json(data);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get("/getbyorder/:id",(req,res) => {
    order.findByPk(req.params.id).then(data => {
        if (data) {
            res.json(data);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

// get id user
app.get("/getallcart/:id",(req,res) => {
    cart.findOne({where:{userid:req.params.id}}).then(data => {
        if (data) {
            res.json({cartuser:JSON.parse(data.dataValues.cartuser)});
        } else {
            res.json(null);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

//connect server
app.listen(port,() => {
    console.log("connect server");
});