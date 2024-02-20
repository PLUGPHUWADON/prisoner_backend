const express = require("express");
const app = express();
const fs = require('fs');
const path = require("path");
const multer = require("multer");
const Sequelize = require('sequelize');
const session = require('express-session');
const { constants } = require("buffer");
require('dotenv').config();

//set environment variables
const port = process.env.PORT;

//set project
app.set("views",path.join(__dirname,"/public/views"));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({secret:"mysession",resave:false,saveUninitialized:false}));

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

app.post("/login",(req,res) => {
    let checkpass = false;
    user.findAll().then(data => {
        data.forEach(e => {
            if (req.body.phone == e.dataValues.phone && req.body.password == e.dataValues.password) {
                checkpass = true;
                req.session.userlogin = e.dataValues.userid;
                console.log(req.session.userlogin);
                res.render("cart.ejs")
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
        if (data.length != 0) {
            for (let i = 0 ; i < data.length ; i++) {
                if (req.body.phone == data[i].dataValues.phone && req.body.username == data[i].dataValues.username) {
                    checksame = true;
                }
            }

            if (!checksame) {
                user.create(req.body).then(() => {
                    res.json(data);
                }).catch(err => {
                    res.status(500).send(err);
                });
            }
            else{
                res.json({});
            }
        }
        else{
            user.create(req.body).then(() => {
                res.json(data);
            }).catch(err => {
                res.status(500).send(err);
            });
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
                        if (req.body.phone == dataall[i].dataValues.phone && req.body.phone != data.dataValues.phone) {
                            checksame = true;
                        }
                    }
        
                    if (!checksame) {
                        data.update(req.body).then(() => {
                            console.log("1")
                            res.json(data);
                        }).catch(err => {
                            res.status(500).send(err);
                        });
                    }
                    else{
                        res.json({});
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

app.post("/createproduct",(req,res) => {
    product.create({
        productname:req.body.productname,
        productcategory:req.body.productcategory,
        productprice:req.body.productprice,
        imgurl:req.body.imgurl
    }).then(data => {
        console.log(req.body)
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
    console.log(req.session.userlogin)
    cart.findOrCreate({ 
        where:{userid:req.session.userlogin},
        defaults:{userid:req.session.userlogin}}).then(data => {
            if (data) {
                cart.findOne({where:{userid:req.session.userlogin}}).then(data1 => {
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

//** method
app.post("/deletecart/:id",(req,res) => {
    cart.findOne({where:{userid:req.session.userlogin}}).then(data => {
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

app.post("/addoder",(req,res) => {
    cart.findOne({where:{userid:req.session.userlogin}}).then(data => {
        if (data) {
            order.create({
                userid:req.session.userlogin,
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
        product.findAll().then(data1 => {
            user.findAll().then(data2 => {
                let arr = [];
                let products = [];

                for (let i = 0 ; i < data.length ; i++) {
                    let arremty = [];
                    for (let j = 0 ; j < JSON.parse(data[i].dataValues.cartuser).length ; j++) {
                        arremty[j] = JSON.parse(data[i].dataValues.cartuser)[j];
                        arremty[j] = {name:arremty[j].id,amount:arremty[j].amount}
                    }
                    products.push(arremty);
                }
                for (let i = 0 ; i < data1.length ; i++) {
                    for (let j = 0 ; j < products.length ; j++) {
                        for (let k = 0 ; k < products[j].length ; k++) {
                            if (data1[i].dataValues.productid == products[j][k].name) {
                                products[j][k].name = data1[i].dataValues.productname;
                            }
                        }
                    }
                }
                data.forEach((e,i) => {
                    arr.push({orderid:e.dataValues.orderid,user:data2[i].dataValues.username,product:products[i]})
                });
                res.json(arr);
            }).catch(err => {
                res.status(500).send(err);
            });
        }).catch(err => {
            res.status(500).send(err);
        });
    }).catch(err => {
        res.status(500).send(err);
    });
});

app.get("/getorderuser/:id",(req,res) => {
    order.findAll({where:{userid:req.params.id}}).then(data => {
        if (data) {
            console.log(data);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

// get id user
app.get("/getallcart/:id",(req,res) => {
    cart.findOne({where:{userid:req.params.id}}).then(data => {
        if (data) {
            res.json(data);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

//connect server
app.listen(port,() => {
    console.log("connect server");
});

// backend เหลือ
//     - get ข้อมูลตะกร้าสินค่า
//     - get ข้อมูล order
//     - get ข้อมูลหมวดหมู่สินค้า
//     - check password ของ admin