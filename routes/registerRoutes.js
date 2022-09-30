const express = require ("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");

router.get('/register', (req, res) => {
  res.render('users/register')
})


router.post('/register', catchAsync(async(req, res, next) => {
  try{
    const {email, username, password} = req.body ;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, err => {
      if(err) {
        return next(err);
      }
      req.flash('success', 'Welcome to Campgrounds!');
      res.redirect('/campgrounds')
    })

  } catch(e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }

}));

router.get('/login', (req, res) => {
  res.render('users/login');
})

//keepSessionInfo should be true after the security updates done to passport 0.6.0
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), (req, res) => {
  req.flash('success', `Welcome back ser!`)
  const redirectUrl = req.session.returnTo || '/campgrounds';
  // if(req.session.returnTo) {
  //   console.log(req.session.returnTo);
  //   return res.redirect(req.session.returnTo);
  // }
  delete req.session.returnTo;                    // removes any residual data stored in the returnTo variable
  res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'see you later 👋');
    res.redirect('/campgrounds');
  });

});


module.exports = router;
