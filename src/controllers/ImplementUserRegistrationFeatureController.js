/**
 * ImplementUserRegistrationFeatureController Controller
 * Request handling for Implement user registration feature
 */

const ImplementUserRegistrationFeatureControllerService = require('../services/ImplementUserRegistrationFeatureControllerService');

class ImplementUserRegistrationFeatureControllerController {
  static async index(req, res, next) {
    try {
      const items = await ImplementUserRegistrationFeatureControllerService.getAll();
      res.json({
        success: true,
        data: items,
        meta: {
          count: items.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async show(req, res, next) {
    try {
      const item = await ImplementUserRegistrationFeatureControllerService.getById(req.params.id);
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async store(req, res, next) {
    try {
      const item = await ImplementUserRegistrationFeatureControllerService.create(req.body);
      res.status(201).json({
        success: true,
        data: item,
        message: 'ImplementUserRegistrationFeatureController created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async update(req, res, next) {
    try {
      const item = await ImplementUserRegistrationFeatureControllerService.update(req.params.id, req.body);
      res.json({
        success: true,
        data: item,
        message: 'ImplementUserRegistrationFeatureController updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async destroy(req, res, next) {
    try {
      await ImplementUserRegistrationFeatureControllerService.delete(req.params.id);
      res.json({
        success: true,
        message: 'ImplementUserRegistrationFeatureController deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ImplementUserRegistrationFeatureControllerController;
