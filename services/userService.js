const bcrypt = require("bcryptjs");
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const { Op } = require('sequelize')
const helpers = require("../_helpers");
const db = require("../models");
const user = require("../models/user");
const Tweet = db.Tweet;
const Reply = db.Reply;
const User = db.User;
const Like = db.Like;
const Followship = db.Followship;

const userService = {
  getUser: (req, res, callback) => {
    const currentUser = req.user ? req.user : helpers.getUser(req);
    User.findOne({ where: { id: req.params.id } }).then((user) => {
      // console.log(req, user, currentUser, helpers.getUser(req));
      return callback({ user: user });
      // User.findOne({ where: { id: currentUser.id } }).then((user) => {
      // return res.render("profile", { user: user });
    });
  },
  // getUser: (req, res) => {
  //   const currentUser = req.user ? req.user : helpers.getUser(req);
  //   User.findOne({ where: { id: req.params.id } }).then((user) => {
  //     return res.json({ user: user });
  //     // User.findOne({ where: { id: currentUser.id } }).then((user) => {
  //     // return res.render("profile", { user: user });
  //   });
  // },
  putUser: (req, res, callback) => {
    const currentUser = req.user ? req.user : helpers.getUser(req);
    if (currentUser.id !== Number(req.params.id)) {
      console.log(req, user, currentUser, helpers.getUser(req));
      callback({ status: "error", message: "只能編輯自己的資訊." });
      // req.flash("error_messages", "只能編輯自己的資訊")
      // return res.redirect(`/users/${currentUser.id}`)
    }
    const { file } = req;
    return Promise.all([
      User.findAll({
        where: {
          email: { [Op.not]: currentUser.email },
        },
      }),
      User.findAll({
        where: {
          account: { [Op.not]: currentUser.account },
        },
      }),
    ]).then(([usersEmail, usersAccount]) => {
      let emailCheck = usersEmail.map((d) => d.email).includes(req.body.email);
      let accountCheck = usersAccount
        .map((d) => d.account)
        .includes(req.body.account);
      console.log("emailCheck", emailCheck, "accountCheck", accountCheck);
      if (
        !req.body.name ||
        !req.body.email ||
        !req.body.account ||
        !req.body.password ||
        !req.body.passwordCheck
      ) {
        callback({
          status: "error",
          message: "名字，信箱，帳號，密碼，確認密碼不能為空!",
        });
        // req.flash( "error_messages", "名字，信箱，帳號，密碼，確認密碼不能為空!");
        // return res.redirect("back");
      }
      if (req.body.password !== req.body.passwordCheck) {
        callback({ status: "error", message: "密碼與確認密碼不一致!" });
        // req.flash("error_messages", "密碼與確認密碼不一致!");
        // return res.redirect("back");
      }
      if (emailCheck) {
        callback({ status: "error", message: "此信箱己被註冊，請更改!" });
        // req.flash("error_messages", "此信箱己被註冊，請更改!");
        // return res.redirect("back");
      }
      if (accountCheck) {
        callback({
          status: "error",
          message: "帳戶名稱已被其他使用者使用，請更改!",
        });
        // req.flash("error_messages", "帳戶名稱已被其他使用者使用，請更改!")
        // return res.redirect("back");
      }
      if (file) {
        // fs.readFile(file.path, (err, data) => {
        imgur.setClientID(IMGUR_CLIENT_ID);
        imgur.upload(file.path, (err, img) => {
          // if (err) console.log("Error: ", err);
          // fs.writeFile(`upload/${file.originalname}`, data, () => {
          return User.findByPk(req.params.id).then((user) => {
            user
              .update({
                ...req.body,
                cover: file ? img.data.link : user.cover,
                avatar: file ? img.data.link : user.avatar,
                // cover: file ? `/upload/${file.originalname}` : req.body.cover,
                // avatar: file ? `/upload/${file.originalname}` : req.body.avatar,
                password: bcrypt.hashSync(
                  req.body.password,
                  bcrypt.genSaltSync(10),
                  null
                ),
              })
              .then((user) => {
                callback({
                  status: "success",
                  message: "使用者資料編輯成功。",
                });
                // req.flash("success_messages", "使用者資料編輯成功");
                // res.redirect(`/users/${req.params.id}`);
              });
          });
        });
        // });
      } else {
        return User.findByPk(req.params.id).then((user) => {
          user
            .update({
              ...req.body,
              cover: user.cover,
              avatar: user.avatar,
              password: bcrypt.hashSync(
                req.body.password,
                bcrypt.genSaltSync(10),
                null
              ),
            })
            .then(() => {
              callback({ status: "success", message: "使用者資料編輯成功。" });
              // req.flash("success_messages", "使用者編輯成功");
              // return res.redirect(`/users/${req.params.id}`);
            });
        });
      }
    });
    // putUser: (req, res) => {
    // const { file } = req;
    // const currentUser = req.user ? req.user : helpers.getUser(req);
    // return Promise.all([
    //   User.findAll({
    //     where: {
    //       email: { [Op.not]: currentUser.email },
    //     },
    //   }),
    //   User.findAll({
    //     where: {
    //       account: { [Op.not]: currentUser.account },
    //     },
    //   }),
    // ]).then(([usersEmail, usersAccount]) => {
    //   let emailCheck = usersEmail.map((d) => d.email).includes(req.body.email);
    //   let accountCheck = usersAccount
    //     .map((d) => d.account)
    //     .includes(req.body.account);
    //   console.log("emailCheck", emailCheck, "accountCheck", accountCheck);
    //   if (
    //     !req.body.name ||
    //     !req.body.email ||
    //     !req.body.account ||
    //     !req.body.password ||
    //     !req.body.passwordCheck
    //   ) {
    //     req.flash(
    //       "error_messages",
    //       "名字，信箱，帳號，密碼，確認密碼不能為空!"
    //     );
    //     return res.redirect("back");
    //   }
    //   if (req.body.password !== req.body.passwordCheck) {
    //     req.flash("error_messages", "密碼與確認密碼不一致!");
    //     return res.redirect("back");
    //   }
    //   if (emailCheck) {
    //     req.flash("error_messages", "此信箱己被註冊，請更改!");
    //     return res.redirect("back");
    //   }
    //   if (accountCheck) {
    //     req.flash("error_messages", "帳戶名稱已被其他使用者使用，請更改!");
    //     return res.redirect("back");
    //   }
    //   if (file) {
    //     // fs.readFile(file.path, (err, data) => {
    //       imgur.setClientID(IMGUR_CLIENT_ID)
    //       imgur.upload(file.path, (err, img) => {
    //       // if (err) console.log("Error: ", err);
    //       // fs.writeFile(`upload/${file.originalname}`, data, () => {
    //         return User.findByPk(req.params.id).then((user) => {
    //           user
    //             .update({
    //               ...req.body,
    //               cover: file ? img.data.link : user.cover,
    //               avatar: file ? img.data.link : user.avatar,
    //               // cover: file ? `/upload/${file.originalname}` : req.body.cover,
    //               // avatar: file ? `/upload/${file.originalname}` : req.body.avatar,
    //               password: bcrypt.hashSync(
    //                 req.body.password,
    //                 bcrypt.genSaltSync(10),
    //                 null
    //               ),
    //             })
    //             .then((user) => {
    //               req.flash("success_messages", "使用者資料編輯成功");
    //               res.redirect(`/users/${req.params.id}`);
    //             });
    //         });
    //       });
    //     // });
    //   } else {
    //     return User.findByPk(req.params.id).then((user) => {
    //       user
    //         .update({
    //           ...req.body,
    //           cover: user.cover,
    //           avatar: user.avatar,
    //           password: bcrypt.hashSync(
    //             req.body.password,
    //             bcrypt.genSaltSync(10),
    //             null
    //           ),
    //         })
    //         .then(() => {
    //           req.flash("success_messages", "使用者編輯成功");
    //           return res.redirect(`/users/${req.params.id}`);
    //         });
    //     });
    //   }
    // });
    // },
  },

  addLike: (req, res, callback) => {
    const currentUser = req.user ? req.user : helpers.getUser(req);
    Like.findOne({
      where: {
        UserId: currentUser.id,
        TweetId: req.params.id,
      },
    }).then((like) => {
      if (!like) {
        return Like.create({
          UserId: currentUser.id,
          TweetId: req.params.id,
          isLike: true,
        }).then((like) => {
          return callback({ status: "error", message: "" });
        });
      }
      if (like.isLike === false) {
        return like.update({ ...like, isLike: !like.isLike }).then((like) => {
          return callback({ status: "success", message: "" });
        });
      }
      return callback({ status: "error", message: "" });
    });
  },
  removeLike: (req, res, callback) => {
    const currentUser = req.user ? req.user : helpers.getUser(req);
    Like.findOne({
      where: {
        UserId: currentUser.id,
        TweetId: req.params.id,
      },
    }).then((like) => {
      if (!like) {
        return Like.create({
          UserId: currentUser.id,
          TweetId: req.params.id,
          isLike: false,
        }).then(like => {
          return callback({ status: 'error', message: '' })
        })
      }
      if (like.isLike === true) {
        return like.update({ ...like, isLike: !like.isLike }).then(like => {
          return callback({ status: 'success', message: '' })
        })
      }
      return callback({ status: 'error', message: '' })
    });
  },

  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: helpers.getUser(req).id,
      followingId: req.params.userId,
    }).then((followship) => {
      return callback({ status: "success", message: "" });
    });
  },
  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId,
      },
    }).then((followship) => {
      followship.destroy().then((followship) => {
        return callback({ status: "success", message: "" });
      });
    });
  },
  getFollowers: (req, res, callback) => {
    return User.findByPk(req.params.id, {
      include: [{ model: User, as: 'Followers' }]
        .then(user => {
          const followersCount = user.Followers.length
          return callback({user: user, followersCount: followersCount})
        })
    })
  },
  getFollowings: (req, res, callback) => {
    return User.findByPk(req.params.id, {
      include: [{ model: User, as: 'Followings' }]
        .then(user => {
          const followingsCount = user.Followings.length
          return callback({ user: user, followingsCount: followingsCount })
        })
    })
  },
  getFollowedUsers: (req, res, callback) => {
    //撈出這個使用者
  }
};

module.exports = userService