import Joi from 'joi';

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    role: Joi.string().valid('admin', 'staff').default('staff')
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  staff: Joi.object({
    name: Joi.string().required(),
    role: Joi.string().required(),
    department: Joi.string().valid('Operations', 'Sales', 'HR', 'Finance', 'Drivers').required(),
    contact: Joi.string().required(),
    active: Joi.string().valid('Yes', 'No').default('Yes')
  }),
  
  supplier: Joi.object({
    name: Joi.string().required(),
    contactPerson: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    company: Joi.string().required(),
    address: Joi.string().allow(''),
    notes: Joi.string().allow('')
  }),
  
  invoice: Joi.object({
    id: Joi.number().required(),
    customer: Joi.string().required(),
    date: Joi.date().required(),
    total: Joi.number().required(),
    status: Joi.string().valid('draft', 'sent', 'paid').default('draft'),
    items: Joi.array().items(Joi.object({
      description: Joi.string(),
      quantity: Joi.number(),
      price: Joi.number(),
      total: Joi.number()
    })),
    notes: Joi.string().allow('')
  }),
  
  trailer: Joi.object({
    trailerNo: Joi.string().required(),
    description: Joi.string().required(),
    vinNo: Joi.string().required(),
    licensePlate: Joi.string().required(),
    regExp: Joi.date().required(),
    oldLicensePlate: Joi.string().allow(''),
    value: Joi.number().required(),
    rent: Joi.number().required(),
    advance: Joi.number().required(),
    status: Joi.string().valid('active', 'inactive', 'maintenance').default('active')
  }),

  customer: Joi.object({
    name: Joi.string().required(),
    contact: Joi.string().required(),
    type: Joi.string().valid('Individual', 'Company').required(),
    ssn: Joi.string().allow(''),
    dl: Joi.string().allow(''),
    workPermit: Joi.string().allow(''),
    cabCard: Joi.string().allow(''),
    truckPolicy: Joi.string().allow('')
  }),

  transaction: Joi.object({
    date: Joi.date().required(),
    amount: Joi.number().required(),
    type: Joi.string().valid('revenue', 'expense').required(),
    category: Joi.string().required(),
    description: Joi.string().allow(''),
    staff: Joi.string().allow(''),
    trailer: Joi.string().allow(''),
    invoice: Joi.string().allow('')
  }),

  purchase: Joi.object({
    type: Joi.string().valid('purchase', 'expense').required(),
    itemName: Joi.when('type', {
      is: 'purchase',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    quantity: Joi.when('type', {
      is: 'purchase',
      then: Joi.number().min(1).required(),
      otherwise: Joi.forbidden()
    }),
    price: Joi.when('type', {
      is: 'purchase',
      then: Joi.number().min(0).required(),
      otherwise: Joi.forbidden()
    }),
    supplier: Joi.when('type', {
      is: 'purchase',
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    expenseType: Joi.when('type', {
      is: 'expense',
      then: Joi.string().valid('fuel', 'maintenance', 'office', 'misc').required(),
      otherwise: Joi.forbidden()
    }),
    amount: Joi.when('type', {
      is: 'expense',
      then: Joi.number().min(0).required(),
      otherwise: Joi.forbidden()
    }),
    date: Joi.date().required(),
    notes: Joi.string().allow('')
  }),

  sale: Joi.object({
    itemName: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    totalAmount: Joi.number().min(0).required(),
    date: Joi.date().required(),
    customer: Joi.string().required(),
    paymentMethod: Joi.string().valid('cash', 'bank', 'credit', 'other').required(),
    notes: Joi.string().allow('')
  })
};

export { validate, schemas };