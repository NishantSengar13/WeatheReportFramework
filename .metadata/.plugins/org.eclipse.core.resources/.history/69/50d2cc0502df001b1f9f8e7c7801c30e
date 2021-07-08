import java.io.IOException;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import FrameworkAssignment.WeatherReportingComparator.Base;
import WebPages.HomePage;

public class TestCase001 extends Base{
	
	@BeforeTest
	public void Before_Test() throws IOException
	{
		
		driver = initializeDriver();
		
		
	}
	
	@Test
	public void EnterSearchBar()
	{
	
	HomePage homePage = PageFactory.initElements(driver, HomePage.class);
	homePage.EnterCity("Ahmedabad", "Gujarat", "India");
	
	}
	
	
	

}
