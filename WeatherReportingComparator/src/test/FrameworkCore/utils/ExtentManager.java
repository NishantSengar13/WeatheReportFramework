package utils;



import java.io.File;
import java.util.Date;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

public class ExtentManager {
	
	private static ExtentReports extent;
	
	public static ExtentReports createInstance()
	{
		String fileName = getReportName();
		String directory = System.getProperty("user.dir") + "/reports/";
		new File(directory).mkdirs();
		String path = directory + fileName;
		ExtentHtmlReporter htmlReporter = new ExtentHtmlReporter(path);
		htmlReporter.config().setEncoding("utf-8");
		htmlReporter.config().setDocumentTitle("Automation Report");
		htmlReporter.config().setReportName("Weather Report");
		htmlReporter.config().setTheme(Theme.DARK);
		
		extent = new ExtentReports();
		extent.setSystemInfo("APIUrl", "https://api.openweathermap.org/data/2.5");
		extent.setSystemInfo("Browser", "Chrome");
		extent.setSystemInfo("WebUrl", "https://www.accuweather.com/");
		extent.attachReporter(htmlReporter);
		
		return extent;
	}
	public static String getReportName()
	{
		Date d = new Date();
		String filename = "AutomationReport" + "_" + d.toString().replace(":", "_").replace(" ", "_") + ".html";
		return filename;	
	}
}
