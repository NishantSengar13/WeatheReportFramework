package utils;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import TestCases.Base;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.markuputils.ExtentColor;
import com.aventstack.extentreports.markuputils.Markup;
import com.aventstack.extentreports.markuputils.MarkupHelper;

public class TestListners implements ITestListener {
	
	

	public void onTestStart(ITestResult result) {
		System.out.println(("*** Running test method " + result.getMethod().getMethodName() + "..."));
		ExtentTestManager.startTest(result.getMethod().getMethodName());
	}
		
	

	public void onTestSuccess(ITestResult result) {
		String logText = "<b>Test Method " + result.getMethod().getMethodName() + " Successful</b>";
		Markup m = MarkupHelper.createLabel(logText, ExtentColor.GREEN);
		ExtentTestManager.getTest().log(Status.PASS, m);
		
	}

	public void onTestFailure(ITestResult result) {
		String methodName = result.getMethod().getMethodName();
		String exceptionMessage = Arrays.toString(result.getThrowable().getStackTrace());
		ExtentTestManager.getTest().fail("<details><summary><b><font color=red>" + 
		"Exception Occured, click to see details:"+ "</font></b></summary>" +
				exceptionMessage.replaceAll(",","<br>")+ "</details> \n");
		
		WebDriver driver = ((Base)result.getInstance()).driver;
		String path = takeScreenshot(driver, methodName);
		System.out.println(path);
		
				try {
					ExtentTestManager.getTest().fail("<details><summary><b><font color=red>" + "Screenshot of failure" + "</font></b></b></summary>",
							MediaEntityBuilder.createScreenCaptureFromPath(path).build());
				} catch (IOException e) {
					ExtentTestManager.getTest().fail("Test Failed, cannot attach screenshot");
				}
		
		String logText = "<b>Test Method " + result.getMethod().getMethodName() + " Failed</b>";
		Markup m = MarkupHelper.createLabel(logText, ExtentColor.RED);
		ExtentTestManager.getTest()	.log(Status.FAIL, m);
	}

	public void onTestSkipped(ITestResult result) {
		// TODO Auto-generated method stub
		
	}

	public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
		// TODO Auto-generated method stub
		
	}

	public void onStart(ITestContext context) {
		System.out.println("*** Test Suite " + context.getName() + " started ***");
		
	}

	public void onFinish(ITestContext context) {
		System.out.println(("*** Test Suite " + context.getName() + " ending ***"));
		ExtentTestManager.endTest();
		ExtentManager.createInstance().flush();
		
	}
	
	public String takeScreenshot(WebDriver driver, String methodName)
	{
		
		
		String fileName = getScreenshotName(methodName);
		String directory = System.getProperty("user.dir") + "/screenshots/";
		new File(directory).mkdirs();
		String path = directory + fileName;
		
	try {
			File screenshot = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
			FileUtils.copyFile(screenshot, new File(path));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	
		return path;
		
	}
	
	public static String getScreenshotName(String methodName)
	{
		Date d = new Date();
		String filename = methodName + "_" + d.toString().replace(":", "_").replace(" ", "_") + ".png";
		return filename;	
	}

}
	