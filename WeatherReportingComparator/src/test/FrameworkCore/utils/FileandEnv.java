package utils;

import java.io.FileInputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class FileandEnv {

	public static Map<String, String> fileandenv = new HashMap<String, String>();
	public static Properties propMain = new Properties();
	public static Properties propPreSet = new Properties();

	public static Map<String, String> envAndFile() {

		String environment = "dev";//System.getProperty("env");

		try {
			if (environment.equalsIgnoreCase("dev")) {

				FileInputStream fisDev = new FileInputStream(System.getProperty("user.dir") + "/inputs/dev.properties");
				propMain.load(fisDev);
				fileandenv.put("ServerUrl", propMain.getProperty("ServerUrl"));
				fileandenv.put("Browser", propMain.getProperty("browser"));
				fileandenv.put("Url", propMain.getProperty("url"));
				fileandenv.put("ChromePath",
						System.getProperty("user.dir") + "/resources/Browser_Drivers/chromedriver.exe");
				fileandenv.put("City", propMain.getProperty("city"));
				fileandenv.put("State", propMain.getProperty("state"));
				fileandenv.put("Country", propMain.getProperty("country"));

			} else if (environment.equalsIgnoreCase("qa")) {
				FileInputStream fisDev = new FileInputStream(System.getProperty("user.dir") + "/inputs/dev.properties");
				propMain.load(fisDev);
				fileandenv.put("ServerUrl", propMain.getProperty("ServerUrl"));
				fileandenv.put("Browser", propMain.getProperty("browser"));
				fileandenv.put("Url", propMain.getProperty("url"));
				fileandenv.put("ChromePath",
						System.getProperty("user.dir") + "/resources/Browser_Drivers/chromedriver.exe");
				fileandenv.put("City", propMain.getProperty("city"));
				fileandenv.put("State", propMain.getProperty("state"));
				fileandenv.put("Country", propMain.getProperty("country"));
				
			} else if (environment.equalsIgnoreCase("staging")) {
				FileInputStream fisDev = new FileInputStream(System.getProperty("user.dir") + "/inputs/dev.properties");
				propMain.load(fisDev);
				fileandenv.put("ServerUrl", propMain.getProperty("ServerUrl"));
				fileandenv.put("Browser", propMain.getProperty("browser"));
				fileandenv.put("Url", propMain.getProperty("url"));
				fileandenv.put("ChromePath",
						System.getProperty("user.dir") + "/resources/Browser_Drivers/chromedriver.exe");
				fileandenv.put("City", propMain.getProperty("city"));
				fileandenv.put("State", propMain.getProperty("state"));
				fileandenv.put("Country", propMain.getProperty("country"));
			}
		} catch (Exception e) {
			// TODO: handle exception
		}

		return fileandenv;

	}

	public static Map<String, String> getConfigReader() {
		if (fileandenv == null) {
			fileandenv = envAndFile();
		}

		return fileandenv;

	}
}
