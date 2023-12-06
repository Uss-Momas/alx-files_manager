
class UsersController {
    static postNew(req, res) {
        console.log(req);
        res.send('User created');
    }
}

module.exports = UsersController;