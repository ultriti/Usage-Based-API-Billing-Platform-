const jwt = require('jsonwebtoken');
const cookie_parser = require('cookie-parser');


// consumer middleware
module.exports.isAunthenticate = async (req, res, next) => {

    console.log("req.cookies.apiProviderToken ",req.cookies.apiProviderToken )
    const token = req.cookies.apiProviderToken || req.headers["apiProviderToken"];
    console.log('--->', token);


    try {
        if (!token) {
            return res.status(401).json({ error: "You are not authenticated" });
        } else {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (!decoded) {
                res.status(404).json({ message: 'unauthorized, token is invalid' })
            }
            console.log('token -> ', decoded);

            req.id = decoded.userId;
            req.email = decoded.email;
            next();
        }
    } catch (error) {
        res.status(404).json({ err: error.message });
    }
}


// provider middleware
module.exports.isProviderAuthenticate = async (req, res, next) => {
    
    const token = req.cookies.apiProviderToken || req.headers["apiProviderToken"];
    console.log('---> prpvider', token);
    console.log('---> prpvider -> ', req.headers["apiProviderToken"] );


    try {
        if (!token) {
            return res.status(401).json({ error: "You are not authenticated" });
        } else {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (!decoded) {
                res.status(404).json({ message: 'unauthorized, token is invalid' })
            }

            console.log("decoded?.role",decoded)

            if (decoded?.role !== "provider") {
                return res.status(404).json({ message: 'you are not autherized ! -' })
            }

            console.log('token -> ', decoded);

            req.id = decoded.userId;
            req.email = decoded.email;
            next();
        }
    } catch (error) {
        res.status(404).json({ err: error.message });
    }
}
