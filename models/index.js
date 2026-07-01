'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// Load Models
db.MediaAsset = require('./MediaAsset')(sequelize, DataTypes);
db.Country = require('./Country')(sequelize, DataTypes);
db.Lead = require('./Lead')(sequelize, DataTypes);
db.Product = require('./Product')(sequelize, DataTypes);
db.Package = require('./Package')(sequelize, DataTypes);
db.PackagePrice = require('./PackagePrice')(sequelize, DataTypes);
db.FAQ = require('./FAQ')(sequelize, DataTypes);
db.ChatSession = require('./ChatSession')(sequelize, DataTypes);
db.ChatMessage = require('./ChatMessage')(sequelize, DataTypes);
db.Setting = require('./Setting')(sequelize, DataTypes);

// New content models
db.Testimonial = require('./Testimonial')(sequelize, DataTypes);
db.Founder = require('./Founder')(sequelize, DataTypes);
db.ManufacturingPartner = require('./ManufacturingPartner')(sequelize, DataTypes);
db.EarningStream = require('./EarningStream')(sequelize, DataTypes);
db.Way = require('./Way')(sequelize, DataTypes);

// Multi-tenant core
db.Owner = require('./Owner')(sequelize, DataTypes);

// --- Associations ---

// Package pricing per country
db.Package.hasMany(db.PackagePrice, { foreignKey: 'packageId', as: 'prices', onDelete: 'CASCADE' });
db.PackagePrice.belongsTo(db.Package, { foreignKey: 'packageId' });

// Chat session and messages
db.ChatSession.hasMany(db.ChatMessage, { foreignKey: 'chatSessionId', as: 'messages', onDelete: 'CASCADE' });
db.ChatMessage.belongsTo(db.ChatSession, { foreignKey: 'chatSessionId' });

// Media assets for Products/Packages (optional featured images)
db.Product.belongsTo(db.MediaAsset, { foreignKey: 'mediaAssetId', as: 'image' });
db.Package.belongsTo(db.MediaAsset, { foreignKey: 'mediaAssetId', as: 'image' });

// Media assets for new content models (optional photos/logos)
db.Testimonial.belongsTo(db.MediaAsset, { foreignKey: 'mediaAssetId', as: 'photo' });
db.Founder.belongsTo(db.MediaAsset, { foreignKey: 'mediaAssetId', as: 'photo' });
db.ManufacturingPartner.belongsTo(db.MediaAsset, { foreignKey: 'mediaAssetId', as: 'logo' });

// EarningStream media (optional image/video)
db.EarningStream.belongsTo(db.MediaAsset, { foreignKey: 'mediaId', as: 'media' });

// Owner media
db.Owner.belongsTo(db.MediaAsset, { foreignKey: 'photoId', as: 'photo' });

// Multi-tenant associations (Owners own their leads and chats)
db.Owner.hasMany(db.Lead, { foreignKey: 'ownerId', as: 'leads', onDelete: 'CASCADE' });
db.Lead.belongsTo(db.Owner, { foreignKey: 'ownerId' });

db.Owner.hasMany(db.ChatSession, { foreignKey: 'ownerId', as: 'chatSessions', onDelete: 'CASCADE' });
db.ChatSession.belongsTo(db.Owner, { foreignKey: 'ownerId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
