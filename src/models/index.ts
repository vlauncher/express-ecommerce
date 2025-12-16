import User from './User';
import Otp from './Otp';
import Store from './Store';

// Associations
Store.hasMany(User, { foreignKey: 'storeId', as: 'users' });
User.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

export { User, Otp, Store };