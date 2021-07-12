package apiVerifictions;

import org.json.JSONArray;
import org.json.JSONObject;
import org.testng.Assert;
import com.aventstack.extentreports.Status;



import io.restassured.response.Response;

import utils.ExtentTestManager;

public class APIVerification {

	public static void responseCodeValiddation(Response response, int statusCode) {

		try {
			Assert.assertEquals(statusCode, response.getStatusCode());
			ExtentTestManager.getTest().log(Status.PASS,
					"Successfully validdated status code, status code is :: " + response.getStatusCode());
		} catch (AssertionError e) {
			ExtentTestManager.getTest().log(Status.FAIL, e.fillInStackTrace());
			ExtentTestManager.getTest().log(Status.FAIL,
					"Expected status code is :: " + statusCode + " , insted of getting :: " + response.getStatusCode());
		} catch (Exception e) {
			ExtentTestManager.getTest().log(Status.FAIL, e.fillInStackTrace());
		}
	}

	public static void responseKeyValidationfromArray(Response response, String key) {
		try {
			JSONArray array = new JSONArray(response.getBody().asString());
			for(int i=0; i<array.length();i++) {
				JSONObject obj = array.getJSONObject(i);
				ExtentTestManager.getTest().log(Status.PASS, "Validetd values are  " + obj.get(key));
				
			}
		} catch (Exception e) {
			ExtentTestManager.getTest().log(Status.FAIL, e.fillInStackTrace());
		}
	}
	
	
	public static void responseKeyValidationFromJsonObject(Response response, String key) {
		try {
			JSONObject json = new JSONObject(response.getBody().asString());
			if(json.has(key) && json.get(key)!= null) {
				ExtentTestManager.getTest().log(Status.PASS, "Sucessfully validated value of " + key + " It is " + json.get(key));
			}else {
				ExtentTestManager.getTest().log(Status.FAIL,"Key is not availble");
			}
		} catch (Exception e) {
			ExtentTestManager.getTest().log(Status.FAIL, e.fillInStackTrace());
		}
	}
	
	
	public static void responseTimeValidation(Response response) {
		try {
			long time=response.time();
			ExtentTestManager.getTest().log(Status.INFO, "Api response time is :: " + time);
		} catch (Exception e) {
			ExtentTestManager.getTest().log(Status.FAIL, e.fillInStackTrace());
		}
	}

}