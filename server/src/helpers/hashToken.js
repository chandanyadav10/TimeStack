import crypto from "node:crypto";

const hashToken = (token) => {
    //hash the token using sha256
    return crypto.createHash('sha256').update(token).digest('hex');
    
}
export default hashToken