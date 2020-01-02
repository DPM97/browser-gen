let utils = {};

// async/await error catcher
utils.catchAsyncErrors = fn => (
    (req, res, next) => {
      const routePromise = fn(req, res, next);
      if (routePromise.catch) {
        routePromise.catch(err => next(err));
      }
    }
  );
  
module.exports = utils;
