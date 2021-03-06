'use strict';

const controller = require('lib/wiring/controller');
const models = require('app/models');
const Blog = models.blog;

const authenticate = require('./concerns/authenticate');

const indexUser = (req, res, next) => {
    let owner = { _owner: req.currentUser._id };
    Blog.find(owner)
      .then(blogs => res.json({ blogs }))
      .catch(err => next(err));
};

const index = (req, res, next) => {
  Blog.find()
    .then(blogs => res.json({ blogs }))
    .catch(err => next(err));
};

const show = (req, res, next) => {
  Blog.findById(req.params.id)
    .then(blog => blog ? res.json({ blog }) : next())
    .catch(err => next(err));
};

const create = (req, res, next) => {
  let blog = Object.assign(req.body.blog, {
    _owner: req.currentUser._id,
  });
  Blog.create(blog)
    .then(blog => res.json({ blog }))
    .catch(err => next(err));
};

const update = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Blog.findOne(search)
    .then(blog => {
      if (!blog) {
        return next();
      }

      delete req.body._owner;  // disallow owner reassignment.
      return blog.update(req.body.blog)
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

const destroy = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Blog.findOne(search)
    .then(blog => {
      if (!blog) {
        return next();
      }

      return blog.remove()
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

module.exports = controller({
  index,
  indexUser,
  show,
  create,
  update,
  destroy,
}, { before: [
  { method: authenticate, except: ['index'] },
], });
