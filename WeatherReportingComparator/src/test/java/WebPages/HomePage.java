package WebPages;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class HomePage {
	
	
		@FindBy(name = "query")
		WebElement searchBox;
		
		
		
		public void EnterCity(String city, String state, String country)
		{
			searchBox.sendKeys(city+", "+state+", "+country);
			searchBox.sendKeys(Keys.ENTER);
			
		}
		
		

}
