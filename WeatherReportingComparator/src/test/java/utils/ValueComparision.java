package utils;

public class ValueComparision {

	public static String CompareTemp(double temp1, double temp2, double variance) {
		String result;

		
			double tempresult = temp1 - temp2;
			if (Math.abs(tempresult) <= variance) {
				result = "Passed";
			} else {
				result = "Failed";
			}

		return result;
	}

}
