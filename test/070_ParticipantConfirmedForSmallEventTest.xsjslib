var helper = $.import("com.sap.sapmentors.sitreg.test.lib", "TestHelper");
var sitRegHelper = $.import("com.sap.sapmentors.sitreg.test.lib", "SITregHelper");
var parameters = $.import("com.sap.sapmentors.sitreg.test", "parameters");

var loginResult;
var header;
var eventUri;
var eventID;
var username = "PARTICIPANT";

describe("Participant", function() {

	it("should login PARTICIPANT and get csrfToken", function() {
		loginResult = helper.getCSRFtokenAndLogin(username, helper.newpwd);
		header = helper.prepareRequestHeader(loginResult.csrf);
	});
	
	it("should read Small-Event and check for waiting status", function() {
		var response = jasmine.callHTTPService(
			parameters.readEventsServiceParticipant,
			$.net.http.GET,
			undefined,
			header,
			loginResult.cookies
		);
		expect(response.status).toBe($.net.http.OK);
		var body = helper.getResponseBody(response);
		for (var i = 0; i < body.d.results.length; ++i) {
			eventUri = body.d.results[i].__metadata.uri;
			eventID = body.d.results[i].ID;
		}

		response = sitRegHelper.getParticipantDetailsForEvent(
			eventID,
			header,
			loginResult.cookies
		);
		expect(response.status).toBe(200);
		body = helper.getResponseBody(response);
		// jasmine.log("body: " + JSON.stringify(body));
		expect(body.d.RSVP).toBe("Y");
		/*
        participantIDmanual = body.d.ID;
        */
	});

    it("should change the registration status and not result into an error when no one is on the waiting list", function() {
        var change = {
            "RSVP": "N"
        };
        var result = sitRegHelper.updateParticipant(eventID, change, header, loginResult.cookies);
        var response = jasmine.callHTTPService(result.participantUrl, $.net.http.GET, undefined, header, loginResult.cookies);
		var body = helper.getResponseBody(response);
        expect(body.d.RSVP).toBe("N");
    });
    
    it("should register the Participant again", function() {
        var change = {
            "RSVP": "Y"
        };
        var result = sitRegHelper.updateParticipant(eventID, change, header, loginResult.cookies);
        var response = jasmine.callHTTPService(result.participantUrl, $.net.http.GET, undefined, header, loginResult.cookies);
		var body = helper.getResponseBody(response);
        expect(body.d.RSVP).toBe("Y");
    });

	it("should try to read organizer OData service as he is now also an organizer", function() {
		var eventUriOrganizer = eventUri.replace("odataparticipant", "odataorganizer");

		var response = jasmine.callHTTPService(
			eventUriOrganizer,
			$.net.http.GET,
			undefined,
			header,
			loginResult.cookies
		);
		expect(response.status).toBe(200);
	});

	it("should logout PARTICIPANT", function() {
		helper.logout(loginResult.csrf, loginResult.cookies);
		helper.checkSession();
	});
});