const express = require('express');
const router = express.Router();

const models = require('../models');


router.get('/add', (req, res) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    const categoryId = 0;
    models.Category.find({})
    .then(category => {
        res.render('category/add', {
            category,
            categoryId,
            user: {
                id: userId,
                login: userLogin
              }
        });
    });
});

router.post('/add', (req, res) => {
    const name = req.body.name;
    
    if (!name) {
        const fields = [];
        fields.push('name');
        res.json({
          ok: false,
          error: 'Поле должно быть заполнено!',
          fields
        });
    }
    else {
        models.Category.create({
        name
    }).then(category => {
        console.log(category);
        res.json({
        ok: true
        });
    })
    .catch(err => {
        console.log(err);
        res.json({
        ok: false
        });
  });
    }
});

module.exports = router;
