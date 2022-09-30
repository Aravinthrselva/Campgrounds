module.exports.isLoggedIn = (req, res, next) => {
  // console.log("Requesting user details... ", req.user);
  if(!req.isAuthenticated()) {

    // console.log(req.originalUrl)
    //store the path the user is trying to access
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in');
    return res.redirect('/login');
  }
  next();
}
