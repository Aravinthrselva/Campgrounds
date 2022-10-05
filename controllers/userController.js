const User = require("../models/user");



module.exports.renderRegisterForm = (req, res) => {
  res.render('users/register')
}



module.exports.registerUser = async(req, res, next) => {
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
}

module.exports.renderLoginForm = (req, res) => {
  res.render('users/login');
}

module.exports.loginAuthetication = (req, res) => {
  req.flash('success', `Welcome back ser!`)
  const redirectUrl = req.session.returnTo || '/campgrounds';      // the first true value is assigned
  // if(req.session.returnTo) {
  //   return res.redirect(req.session.returnTo);
  // }
  delete req.session.returnTo;                    // removes any residual data stored in the returnTo session variable
  res.redirect(redirectUrl);
}



module.exports.logoutUser = (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'see you later 👋');
    res.redirect('/campgrounds');
  });

}
