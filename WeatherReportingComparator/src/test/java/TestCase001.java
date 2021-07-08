import java.io.IOException;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import FrameworkAssignment.WeatherReportingComparator.Base;
import WebPages.HomePage;
import WebPages.WeatherForecast;

public class TestCase001 extends Base{
	
	@BeforeTest
	public void Before_Test() throws IOException
	{
		
		driver = initializeDriver();
		
	}
	
	@Test
	public void AccuWeather()
	{
	
	HomePage hp = new HomePage(driver);
	WeatherForecast wf = hp.EnterCity("Ahmedabad", "Gujarat", "India");
	wf.clickMoreDetails();
	
	}
	
	
}
