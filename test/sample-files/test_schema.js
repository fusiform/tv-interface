/**
 * org_schema - The organization schema for all orgs.
 *
 * @return {JSON} JSON of the group policy
 */
module.exports = {
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
    }, {
        name: "org_street",
        index: true,
        type: "string"
    }, {
        name: "org_city",
        index: true,
        type: "string"
    }, {
        name: "org_state",
        index: true,
        type: "string"
    }, {
        name: "org_zip",
        index: true,
        type: "string"
    }]
};
