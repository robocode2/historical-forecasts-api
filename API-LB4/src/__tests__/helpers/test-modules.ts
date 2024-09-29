require('dotenv').config();

import {
  Client,
  StubbedInstanceWithSinonAccessor,
  createStubInstance,
  givenHttpServerConfig,
  supertest
} from '@loopback/testlab';


import chai from 'chai';
chai.config.includeStack = true;

const AssertionError = chai.AssertionError;
const expect = chai.expect;

import sinon, {SinonSpy, SinonStub} from 'sinon';

export {
  AssertionError, Client, SinonSpy,
  SinonStub, StubbedInstanceWithSinonAccessor, createStubInstance, expect, givenHttpServerConfig, sinon, supertest
};
