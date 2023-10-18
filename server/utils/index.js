import bcrypt from 'bcryptjs'
import JWT from 'jsonwebtoken'

export const hashString=async(useValue)=>{
  const salt=await bcrypt.genSalt(10);

  const hashedPassword=await bcrypt.hash(useValue,salt)
  return hashedPassword;
}

export const compareString=async(userPassword,password)=>{
  const isMatch=await bcrypt.compare(userPassword,password);
  return isMatch;
}

//JSON webtoken

export function createJWT(id) {
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error('JWT secret key is missing. Make sure to set it as an environment variable.');
  }

  return JWT.sign({ userId: id }, secretKey, {
    expiresIn: '1d',
  });
}