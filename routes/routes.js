const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const replyController = require('../controllers/replyController.js')
const tweetController = require('../controllers/tweetController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

// 如果使用者訪問首頁，就導向 /tweets 的頁面
router.get('/', authenticated, (req, res) => res.redirect('/tweets'))

// 在 /tweets 底下則交給 tweetController.getTweets 來處理
router.get('/tweets', authenticated, tweetController.getTweets)
// 使用者新增一篇推文
router.post('/tweets', authenticated, tweetController.postTweet)
// 拿到特定一筆推文
router.get('/tweets/:id', authenticated, tweetController.getTweet)
// 新增一筆推文的回覆
router.post('/tweets/:tweet_id/replies', authenticated, replyController.postReply)
// 瀏覽一筆推文的所有回覆
router.get('/tweets/:tweet_id/replies', authenticated, replyController.getReplies)
// 對特定一筆推文喜歡
router.post('/tweets/:id/like', authenticated, userController.addLike)
// 對特定一筆推文取消喜歡
router.post('/tweets/:id/unlike', authenticated, userController.removeLike)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

// 使用者個人資料頁
router.get('/users/:id/profile', authenticated, userController.profileUser)
router.put('/users/:id/revise', authenticated, userController.reviseUser)
router.get('/users/:id', authenticated, userController.getUser)
// 使用者到編輯頁
router.get('/users/:id/edit', authenticated, userController.editUser)
// router.put("/users/:id", authenticated, userController.putUser)
router.put('/users/:id', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), authenticated, userController.putUser)

// 查詢user的所有推文
router.get('/users/:userId/tweets', authenticated, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), userController.getUserTweets)
// 查詢user的所有留言
router.get('/users/:userId/replied_tweets', authenticated, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), userController.getUserReplies)
// 查詢user的所有likes的推文
router.get('/users/:userId/likes', authenticated, userController.getUserLikes)

// 新增一位追蹤者
router.post('/followships/:id', authenticated, userController.addFollowing)
// 新增一位追蹤者
router.delete('/followships/:id', authenticated, userController.removeFollowing)

// 管理者可以看見站內所有的使用者
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
// 管理者可以看見站內所有的推文
router.get(
  '/admin/tweets',
  authenticated,
  authenticatedAdmin,
  adminController.getTweets
)
// 管理者可以刪除特定推文
router.delete(
  '/admin/tweets/:id',
  authenticated,
  authenticatedAdmin,
  adminController.deleteTweet
)

// c hatroom
router.get('/chatroom')

module.exports = router