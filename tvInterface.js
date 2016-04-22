var request = require('request')

module.exports = function(config) {
  var TV_API_KEY = config.TV_API_KEY;
  var TV_ACCOUNT_ID = config.TV_ACCOUNT_ID;
  var TV_ADMIN_VAULT_ID = config.TV_ADMIN_VAULT_ID;


  if (!config.TV_API_KEY || !config.TV_ACCOUNT_ID || !config.TV_ADMIN_VAULT_ID) {
    throw Error("001-TV Interface must be instantiated with an API Key, Account ID, Admin Vault ID, Org Schema ID.")
  }

  var TV_API_KEY_ENC = new Buffer(config.TV_API_KEY + ":").toString('base64');
  var TV_AUTH_HEADER = "Basic " + TV_API_KEY_ENC;

  var tvModule = {};

  /**
    Create a new Organization Vault
      pass: organization_JSON
      Will create a new org vault and store ID in vault of organization_JSON
      Name is senstive to organization.is_vendor
      callback(error, updated_organization_JSON)
    **/
  tvModule.createOrganizationVault = function(organization, callback) {
    if (organization.id == '') {
      return callback(Error("Organization must have an ID prior to being created"), null);
    }
    var prefix = "cli_";
    if (organization.is_vendor) {
      prefix = "ven_"
    }

    var vaultCreateOptions = {
      method: 'POST',
      url: 'https://api.truevault.com/v1/vaults',
      headers: {
        authorization: TV_AUTH_HEADER
      },
      formData: {
        name: prefix + organization.id
      }
    };

    request(vaultCreateOptions, function(error, response, vaultCreatedBody) {
      if (error) return callback(Error(error), null);
      var vaultCreatedParsed = JSON.parse(vaultCreatedBody);
      var vault = vaultCreatedParsed.vault.id;
      organization.vault = vault;

      return callback(null, organization);
    });

  }


  tvModule.createOrgGroupPolicy = function(organization, callback) {

    var group_policy = [{
      Resources: [
        "Vault::" + organization.vault + "::Document"
      ],
      Activities: "RUD"
    }, {
      Resources: [
        "Vault::" + organization.vault + "::Search::"
      ],
      Activities: "R"
    }];
    var group_policy_enc = new Buffer(JSON.stringify(group_policy)).toString('base64')

    var groupPolicyCreateOptions = {
      method: 'POST',
      url: 'https://api.truevault.com/v1/groups',
      headers: {
        authorization: TV_AUTH_HEADER
      },
      formData: {
        name: "cli_policy_" + organization.id,
        policy: group_policy_enc
      }
    };

    request(groupPolicyCreateOptions, function(error, response, policyCreatedBody) {
      if (error) return callback(Error(error), null);
      var policyCreatedParsed = JSON.parse(policyCreatedBody);
      var group_policy_id = policyCreatedParsed.group.group_id;
      organization.group_policy = group_policy_id;
      // console.log("Created group policy named " + policyCreatedParsed.group.name +" with ID " + group_policy_id);
      return callback(null, organization)
    });
  };

  tvModule.addOrgPatientSchema = function(organization, callback) {

    var patient_schema = {
      name: "patient",
      fields: [{
        name: "first_name",
        index: true,
        type: "string"
      }, {
        name: "last_name",
        index: true,
        type: "string"
      }, {
        name: "clinic_id",
        index: true,
        type: "string"
      }, {
        name: "dob",
        index: true,
        type: "string"
      }, {
        name: "email",
        index: true,
        type: "string"
      }, {
        name: "phone",
        index: true,
        type: "string"
      }, {
        name: "address",
        index: false,
        type: "string"
      }, {
        name: "owner_id",
        index: true,
        type: "string"
      }, {
        name: "height",
        index: true,
        type: "float"
      }, {
        name: "weight",
        index: true,
        type: "float"
      }, {
        name: "notes",
        index: true,
        type: "string"
      }, {
        name: "needs_attention",
        index: true,
        type: "boolean"
      }, {
        name: "orders",
        index: true,
        type: "string"
      }, {
        name: "media",
        index: true,
        type: "string"
      }]
    }

    var patient_schema_enc = new Buffer(JSON.stringify(patient_schema)).toString('base64');

    var patientSchemaCreateOptions = {
      method: 'POST',
      url: 'https://api.truevault.com/v1/vaults/' + organization.vault + '/schemas',
      headers: {
        authorization: TV_AUTH_HEADER
      },
      formData: {
        schema: patient_schema_enc
      }
    };

    request(patientSchemaCreateOptions, function(error, response, schemaCreatedBody) {
      if (error) return callback(Error(error), null);
      var schemaCreatedBodyParsed = JSON.parse(schemaCreatedBody);
      console.log(schemaCreatedBodyParsed)
      var schema_id = schemaCreatedBodyParsed.schema.id;
      organization.patient_schema = schema_id;
      // console.log("Created group policy named " + policyCreatedParsed.group.name +" with ID " + group_policy_id);
      return callback(null, organization)
    });
  };

  tvModule.pushOrgDocument = function(organization, callback) {
    var request = require("request");
    console.log(organization)
    var org_enc = new Buffer(JSON.stringify(organization)).toString('base64');
    console.log(org_enc)
    console.log(config.TV_ORG_SCHEMA_ID)
    var options = {
      method: 'POST',
      url: 'https://api.truevault.com/v1/vaults/' + TV_ADMIN_VAULT_ID + '/documents',
      headers: {
        authorization: TV_AUTH_HEADER
      },
      formData: {
        document: org_enc,
        schema_id: config.TV_ORG_SCHEMA_ID
      }
    };

    request(options, function(error, response, orgPushedBody) {
      if (error) return callback(error, null);
      var orgPushedBodyParsed = JSON.parse(orgPushedBody);
      console.log(orgPushedBodyParsed)
      if (orgPushedBodyParsed.error) {
        return callback(Error(orgPushedBodyParsed.error.message))
      }
      return callback(null, "Success");
    });

  }

  tvModule.pushOrgSchema = function(callback) {
    var org_schema = {
      name: "organization",
      fields: [{
        name: "name",
        index: true,
        type: "string"
      }, {
        name: "id",
        index: true,
        type: "string"
      }, {
        name: "vault",
        index: true,
        type: "string"
      }, {
        name: "patient_schema",
        index: true,
        type: "string"
      }, {
        name: "group_policy",
        index: true,
        type: "string"
      }, {
        name: "is_vendor",
        index: true,
        type: "boolean"
      }, {
        name: "is_active",
        index: true,
        type: "boolean"
      }, {
        name: "admins",
        index: true,
        type: "string"
      }, {
        name: "users",
        index: true,
        type: "string"
      }]
    }

    var org_schema_enc = new Buffer(JSON.stringify(org_schema)).toString('base64');

    var orgSchemaCreateOptions = {
      method: 'POST',
      url: 'https://api.truevault.com/v1/vaults/' + TV_ADMIN_VAULT_ID + '/schemas',
      headers: {
        authorization: TV_AUTH_HEADER
      },
      formData: {
        schema: org_schema_enc
      }
    };

    request(orgSchemaCreateOptions, function(error, response, schemaCreatedBody) {
      if (error) return callback(Error(error));
      var schemaCreatedBodyParsed = JSON.parse(schemaCreatedBody);
      console.log(schemaCreatedBodyParsed)
      if (schemaCreatedBodyParsed.error) {
        return callback(Error(schemaCreatedBodyParsed.error.message))
      }
      var schema_id = schemaCreatedBodyParsed.schema.id;
      // console.log("Created group policy named " + policyCreatedParsed.group.name +" with ID " + group_policy_id);
      return callback(null)
    });
  }

  tvModule.searchForOrgByName = function(name, callback) {
    var search_option = {
      filter: {
        name: {
          type: "eq",
          value: name,
          case_sensitive: false
        }
      },
      full_document: true,
      page: 1,
      per_page: 3,
      schema_id: config.TV_ORG_SCHEMA_ID
    }

    var search_option_enc = new Buffer(JSON.stringify(search_option)).toString('base64')

    var options = {
      method: 'POST',
      url: 'https://api.truevault.com/v1/vaults/' + config.TV_ADMIN_VAULT_ID+ '/search',
      headers: {
        authorization: TV_AUTH_HEADER
      },
      formData: {
        search_option: search_option_enc
      }
    };

    request(options, function(error, response, searchBody) {
      if (error) return callback(Error(error));
      var searchBodyParsed = JSON.parse(searchBody);
      console.log(searchBodyParsed)
      if (searchBodyParsed.error) {
        return callback(Error(searchBodyParsed.error.message))
      }

      return callback(null, searchBodyParsed)
    });


  }
  tvModule.test = function() {
    return "hello world";
  }

  return tvModule;
};
