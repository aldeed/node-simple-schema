/* eslint-disable func-names, prefer-arrow-callback */

import expect from 'expect';
import { SimpleSchema } from './SimpleSchema';

describe('SimpleSchema', function () {
  describe('oneOf', function () {
    it('allows either type', function () {
      const schema = new SimpleSchema({
        foo: SimpleSchema.oneOf(String, Number, Date),
      });

      const test1 = { foo: 1 };
      expect(function test1func () {
        schema.validate(test1);
      }).toNotThrow();
      expect(test1.foo).toBeA('number');

      const test2 = { foo: 'bar' };
      expect(function test2func () {
        schema.validate(test2);
      }).toNotThrow();
      expect(test2.foo).toBeA('string');

      const test3 = { foo: new Date() };
      expect(function test2func () {
        schema.validate(test3);
      }).toNotThrow();
      expect(test3.foo instanceof Date).toBe(true);

      const test4 = { foo: false };
      expect(function test3func () {
        schema.validate(test4);
      }).toThrow();
      expect(test4.foo).toBeA('boolean');
    });

    it('allows either type including schemas (first)', function () {
      const schemaOne = new SimpleSchema({
        itemRef: String,
        partNo: String,
      });

      const schemaTwo = new SimpleSchema({
        anotherIdentifier: String,
        partNo: String,
      });

      const combinedSchema = new SimpleSchema({
        item: SimpleSchema.oneOf(String, schemaOne, schemaTwo),
      });

      let isValid = combinedSchema.namedContext().validate({
        item: 'foo',
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          anotherIdentifier: 'hhh',
          partNo: 'ttt',
        },
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          itemRef: 'hhh',
          partNo: 'ttt',
        },
      });
      expect(isValid).toBe(true);
    });

    it('allows either type including schemas (second)', function () {
      const schemaTwo = new SimpleSchema({
        itemRef: String,
        partNo: String,
      });

      const schemaOne = new SimpleSchema({
        anotherIdentifier: String,
        partNo: String,
      });

      const combinedSchema = new SimpleSchema({
        item: SimpleSchema.oneOf(String, schemaOne, schemaTwo),
      });

      let isValid = combinedSchema.namedContext().validate({
        item: 'foo',
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          anotherIdentifier: 'hhh',
          partNo: 'ttt',
        },
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          itemRef: 'hhh',
          partNo: 'ttt',
        },
      });
      expect(isValid).toBe(true);
    });

    it('allows either type including schemas (nested)', function () {
      const schemaTwo = new SimpleSchema({
        itemRef: String,
        partNo: String,
        obj: Object,
        'obj.inner': String,
      });

      const schemaOne = new SimpleSchema({
        anotherIdentifier: String,
        partNo: String,
        obj2: Object,
        'obj2.inner': String,
      });

      const schemaA = new SimpleSchema({
        item1: SimpleSchema.oneOf(schemaOne, schemaTwo),
      });

      const schemaB = new SimpleSchema({
        item2: SimpleSchema.oneOf(schemaOne, schemaTwo),
      });

      const combinedSchema = new SimpleSchema({
        item: SimpleSchema.oneOf(schemaA, schemaB),
      });

      let isValid = combinedSchema.namedContext().validate({
        item: {
          item1: {
            itemRef: 'test',
            partNo: 'test',
            obj: {
              inner: 'test',
            },
          },
        },
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          item2: {
            itemRef: 'test',
            partNo: 'test',
            obj: {
              inner: 'test',
            },
          },
        },
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          item1: {
            anotherIdentifier: 'test',
            partNo: 'test',
            obj2: {
              inner: 'test',
            },
          },
        },
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          item2: {
            anotherIdentifier: 'test',
            partNo: 'test',
            obj2: {
              inner: 'test',
            },
          },
        },
      });
      expect(isValid).toBe(true);
      isValid = combinedSchema.namedContext().validate({
        item: {
          item2: {
            badKey: 'test',
            partNo: 'test',
          },
        },
      });
      expect(isValid).toBe(false);
      isValid = combinedSchema.namedContext().validate({
        item: {
          item2: {
          },
        },
      });
      expect(isValid).toBe(false);
    });

    it('allows either type including schemas (nested differing types)', function () {
      // this test case is to ensure we correctly use a new "root" schema for nested objects
      const schemaTwo = new SimpleSchema({
        itemRef: String,
        partNo: String,
        obj: Object,
        'obj.inner': String,
      });

      const schemaOne = new SimpleSchema({
        anotherIdentifier: String,
        partNo: String,
        obj: Object,
        'obj.inner': Number,
      });

      const combinedSchema = new SimpleSchema({
        item: SimpleSchema.oneOf(schemaOne, schemaTwo),
      });
      let isValid = combinedSchema.namedContext().validate({
        item: {
          itemRef: 'test',
          partNo: 'test',
          obj: {
            inner: 'test',
          },
        },
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          anotherIdentifier: 'test',
          partNo: 'test',
          obj: {
            inner: 2,
          },
        },
      });
      expect(isValid).toBe(true);

      isValid = combinedSchema.namedContext().validate({
        item: {
          itemRef: 'test',
          partNo: 'test',
          obj: {
            inner: 2,
          },
        },
      });
      expect(isValid).toBe(false);

      isValid = combinedSchema.namedContext().validate({
        item: {
          anotherIdentifier: 'test',
          partNo: 'test',
          obj: {
            inner: 'test',
          },
        },
      });
      expect(isValid).toBe(false);
    })

    it('is valid as long as one min value is met', function () {
      const schema = new SimpleSchema({
        foo: SimpleSchema.oneOf({
          type: SimpleSchema.Integer,
          min: 5,
        }, {
          type: SimpleSchema.Integer,
          min: 10,
        }),
      });

      expect(function () {
        schema.validate({ foo: 7 });
      }).toNotThrow();
    });

    it('works when one is an array', function () {
      const schema = new SimpleSchema({
        foo: SimpleSchema.oneOf(String, Array),
        'foo.$': String,
      });

      expect(function () {
        schema.validate({
          foo: 'bar',
        });
      }).toNotThrow();

      expect(function () {
        schema.validate({
          foo: 1,
        });
      }).toThrow();

      expect(function () {
        schema.validate({
          foo: [],
        });
      }).toNotThrow();

      expect(function () {
        schema.validate({
          foo: ['bar', 'bin'],
        });
      }).toNotThrow();

      expect(function () {
        schema.validate({
          foo: ['bar', 1],
        });
      }).toThrow();
    });

    it('works when one is a schema', function () {
      const objSchema = new SimpleSchema({
        _id: String,
      });

      const schema = new SimpleSchema({
        foo: SimpleSchema.oneOf(String, objSchema),
      });

      expect(function () {
        schema.validate({
          foo: 'bar',
        });
      }).toNotThrow();

      expect(function () {
        schema.validate({
          foo: 1,
        });
      }).toThrow();

      expect(function () {
        schema.validate({
          foo: [],
        });
      }).toThrow();

      expect(function () {
        schema.validate({
          foo: {},
        });
      }).toThrow();

      expect(function () {
        schema.validate({
          foo: {
            _id: 'ID',
          },
        });
      }).toNotThrow();
    });

    it('is invalid if neither min value is met', function () {
      const schema = new SimpleSchema({
        foo: SimpleSchema.oneOf({
          type: SimpleSchema.Integer,
          min: 5,
        }, {
          type: SimpleSchema.Integer,
          min: 10,
        }),
      });

      expect(function () {
        schema.validate({ foo: 3 });
      }).toThrow();
    });
  });
});
