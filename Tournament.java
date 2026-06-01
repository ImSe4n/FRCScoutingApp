
/**
 * Write a description of class Tournament here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */

import java.util.ArrayList;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class Tournament
{
    private ArrayList<ScoutedRobot> scoutRobots;
    private ScoutedRobot[][] matchSchedule;
    private short shrMatchCount;
    
    //maybe have a constant to limit number of matches
    //private static final short MAXMATCHES = 100;
    
    public Tournament(){
        this.scoutRobots = new ArrayList<ScoutedRobot>();
        this.matchSchedule = new ScoutedRobot[50][6]; //assume each tournament has 50 qualification matches (for now)
    }
    
    public void addRobot(ScoutedRobot robot){
        this.scoutRobots.add(robot);
    }
    
    public void addRobot(short shrTeamNumber){
        ScoutedRobot newScoutedRobot = new ScoutedRobot(shrTeamNumber);
        this.scoutRobots.add(newScoutedRobot);
    }
    
    //get team number from a string -> get from file later
    public void addRobot(String strTeamNumber){
        try{
            short shrTeamNumber = Short.parseShort(strTeamNumber.trim());
            ScoutedRobot newScoutedRobot = new ScoutedRobot(shrTeamNumber);
            
            this.scoutRobots.add(newScoutedRobot);
        }
        catch (NumberFormatException e){
            System.out.println("Invalid team number!");
        }
    }
    
    public void addMatchToSchedule(short shrMatchIndex, ScoutedRobot red1, ScoutedRobot red2, ScoutedRobot red3, ScoutedRobot blue1, ScoutedRobot blue2, ScoutedRobot blue3){
        if (shrMatchIndex >= 0 && shrMatchIndex < this.matchSchedule.length){
            this.matchSchedule[shrMatchIndex][0] = red1;
            this.matchSchedule[shrMatchIndex][1] = red2;
            this.matchSchedule[shrMatchIndex][2] = red3;
            this.matchSchedule[shrMatchIndex][3] = blue1;
            this.matchSchedule[shrMatchIndex][4] = blue2;
            this.matchSchedule[shrMatchIndex][5] = blue3;
            if (shrMatchIndex >= this.shrMatchCount){
                this.shrMatchCount = (short)(shrMatchIndex + 1);
            }
        }
    }
    
    //sort the scores of each robot using merge sort
    public void sortByScore(){
        this.mergeSort(this.scoutRobots, 0, this.scoutRobots.size() - 1);
    }
    
    private void mergeSort(ArrayList<ScoutedRobot> robotList, int left, int right){
        int middle;
        
        //check if there are more than one element in the array
        if (left < right) 
        {
            //find the middle point of the array
            middle = (left + right) / 2;

            //recursively sort the first and second halves
            mergeSort(robotList, left, middle);
            mergeSort(robotList, middle + 1, right);

            //merge the sorted halves
            merge(robotList, left, middle, right);
        }
    }
    
    private void merge(ArrayList<ScoutedRobot> robotList, int left, int mid, int right){
        //calculate the sizes of the two subarrays to be merged
        int intLeftSize = mid - left + 1;
        int intRightSize = right - mid;
        
        //temporary arraylists that will store the "sorted" scores
        ArrayList<ScoutedRobot> leftList = new ArrayList<ScoutedRobot>();
        ArrayList<ScoutedRobot> rightList = new ArrayList<ScoutedRobot>();
        
        //copy data to the temp arraylists
        for (int i = 0; i < intLeftSize; i++) 
        {
            leftList.add(robotList.get(left + i));
        }
        
        for (int j = 0; j < intRightSize; j++) 
        {
            rightList.add(robotList.get(mid + 1 + j));
        }

        //merge the temporary arraylists

        //initial indexes of the two subarrays
        int i = 0;
        int j = 0;

        //initial index of the merged subarray
        int k = left;
        
        while (i < intLeftSize && j < intRightSize) 
        {
            //compare elements of the two subarrays and merge them in ascending 
            //order
            if (leftList.get(i).getIndividualScore() >= rightList.get(j).getIndividualScore()) 
            {
                robotList.set(k, leftList.get(i));
                i++;
            } 
            else 
            {
                robotList.set(k, rightList.get(j));
                j++;
            }
            k++;
        }

        //copy remaining elements of leftList if any
        while (i < intLeftSize) 
        {
            robotList.set(k, leftList.get(i));
            i++;
            k++;
        }

        //copy remaining elements of rightList if any
        while (j < intRightSize) 
        {
            robotList.set(k, rightList.get(j));
            j++;
            k++;
        }
    }
    
    //use binary search to find a robot based on their team number
    public ScoutedRobot findRobot(short shrTeamNumber){
        this.sortByTeamNumber();
        
        int intLeft = 0;
        int intRight = this.scoutRobots.size() - 1;
        
        while (intLeft <= intRight){
            int intMid = intLeft + (intRight - intLeft) / 2;
            
            short shrMidTeam = this.scoutRobots.get(intMid).getTeamNumber();
            
            if (shrMidTeam == shrTeamNumber){
                return this.scoutRobots.get(intMid);
            }
            else if (shrMidTeam < shrTeamNumber){
                intLeft = intMid + 1;
            }
            else {
                intRight = intMid;
            }
        }
        
        //if the robot is not found, return null
        return null;
    }
    
    //use insertion sort to sort the teams by team number
    private void sortByTeamNumber(){
        //length of the array
        int listLength = this.scoutRobots.size(); 
        
        //variable to hold the current element being compared
        ScoutedRobot key; 
        
        //variable for the inner loop
        int j; 

        //iterate through the array starting from the second element
        for (int i = 1; i < listLength; ++i) 
        {
            //current element to be compared
            key = this.scoutRobots.get(i);
            
            //index of the element to the left of the current element
            j = i - 1; 

            //move elements of the arraylist 0, i-1... that are greater than key to one 
            //position ahead of their current position
            //this loop shifts elements to the right until the correct position 
            //for key is found
            while (j >= 0 && this.scoutRobots.get(j).getTeamNumber() > key.getTeamNumber()) 
            {
                //move the element to the right
                this.scoutRobots.set(j + 1, this.scoutRobots.get(j));
                
                //move to the previous position for comparison
                j = j - 1; 
            }

            //place the key in its correct position in the sorted part of 
            //the array
            this.scoutRobots.set(j + 1, key);
        }
    }
}
