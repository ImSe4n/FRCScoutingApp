
/**
 * Handles all of the data for a tournament
 * Kind of like the database for scouted teams?
 * Includes all the logic for sorting teams
 *
 * @author Sean Nie
 * @version 2026-06-08
 */

import java.util.ArrayList;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class Tournament
{
    //instance variables
    private ArrayList<ScoutedRobot> scoutRobots;
    private short shrMatchCount;
    
    //maybe have a constant to limit number of matches
    //private static final short MAXMATCHES = 100;
    
    //constructor to initialize an empty tournament
    public Tournament(){
        this.scoutRobots = new ArrayList<ScoutedRobot>();
    }
    
    //add an already instantiated ScoutedRobot object directly to the list of scouted robots
    public void addRobot(ScoutedRobot robot){
        this.scoutRobots.add(robot);
    }
    
    //add a robot based on the team number
    public void addRobot(short shrTeamNumber){
        ScoutedRobot newScoutedRobot = new ScoutedRobot(shrTeamNumber);
        this.scoutRobots.add(newScoutedRobot);
    }
    
    //merge sort to sort the weighed scores (for the picklist tab)
    public void sortByWeightedScore(byte bytFuel, byte bytClimb, byte bytDef){
        this.mergeSortWeighted(this.scoutRobots, 0, this.scoutRobots.size() - 1, bytFuel, bytClimb, bytDef);
    }
    
    private void mergeSortWeighted(ArrayList<ScoutedRobot> robotList, int left, int right, byte bytFuel, byte bytClimb, byte bytDef) {
        //check if there are more than one element in the array
        if (left < right) {
            //find the midpoint of the array lsit
            int middle = (left + right) / 2;
            
            //recursively sort the first and second halves
            mergeSortWeighted(robotList, left, middle, bytFuel, bytClimb, bytDef);
            mergeSortWeighted(robotList, middle + 1, right, bytFuel, bytClimb, bytDef);
            
            //merge the sorted halves
            mergeWeighted(robotList, left, middle, right, bytFuel, bytClimb, bytDef);
        }
    }

    private void mergeWeighted(ArrayList<ScoutedRobot> robotList, int left, int mid, int right, byte bytFuel, byte bytClimb, byte bytDef) {
        //calculate the sizes of the two subarrays to be merged
        int intLeftSize = mid - left + 1;
        int intRightSize = right - mid;
        
        //temporary arraylists that will store the "sorted" scores
        ArrayList<ScoutedRobot> leftList = new ArrayList<>();
        ArrayList<ScoutedRobot> rightList = new ArrayList<>();
        
        //copy data to the temp arraylists
        for (int i = 0; i < intLeftSize; i++){
            leftList.add(robotList.get(left + i));
        }
        
        for (int j = 0; j < intRightSize; j++){
            rightList.add(robotList.get(mid + 1 + j));
        }
        
        //initial indexes of the two subarrays
        int i = 0;
        int j = 0;
        
        //initial index of the merged subarray
        int k = left;
        
        //merge the temporary arraylists
        while (i < intLeftSize && j < intRightSize) {
            //calculate weighted score for the left robot
            ScoutedRobot r1 = leftList.get(i);
            int score1 = (r1.getAutoFuelCount() + r1.getTeleFuelCount() + r1.getEndFuelCount()) * bytFuel + (r1.getClimbLevel() * 10) * bytClimb + (r1.getDefenceTime()) * bytDef;
                       
            //calculate weighted score for the right robot
            ScoutedRobot r2 = rightList.get(j);
            int score2 = (r2.getAutoFuelCount() + r2.getTeleFuelCount() + r2.getEndFuelCount()) * bytFuel + (r2.getClimbLevel() * 10) * bytClimb + (r2.getDefenceTime()) * bytDef;
            
            //sort descending based on weights
            if (score1 >= score2) {
                robotList.set(k, leftList.get(i));
                i++;
            } else {
                robotList.set(k, rightList.get(j));
                j++;
            }
            k++;
        }
        
        //copy remaining elements of leftList if any
        while (i < intLeftSize){
            robotList.set(k, leftList.get(i));
            i++;
            k++;
        }
        
        //copy remaining elements of rightList if any
        while (j < intRightSize) {
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
                intRight = intMid - 1;
            }
        }
        
        //if the robot is not found, return null
        return null;
    }
    
    //use insertion sort to sort the teams by team number
    //needed for binary search
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

            //place the scouted robot in its correct position in the sorted part of 
            //the arraylist
            this.scoutRobots.set(j + 1, key);
        }
    }
    
    //use oos to write the object to a file
    public void saveToFile(String strFileName){
        try {
            ObjectOutputStream objectWriter = new ObjectOutputStream(new FileOutputStream(strFileName));
            
            objectWriter.writeObject(this.scoutRobots);
            objectWriter.close();
        }
        catch (IOException e){
            System.out.println("Error handling file");
        }
    }
    
    //ois to retrieve an object
    public void loadFromFile(String strFileName){
        try {
            ObjectInputStream objectReader = new ObjectInputStream(new FileInputStream(strFileName));
            
            ArrayList<ScoutedRobot> loadedRobots = (ArrayList<ScoutedRobot>)objectReader.readObject(); //need to cast as Object cannot be converted to the ScoutedRobot array list
            this.scoutRobots = loadedRobots;
            
            objectReader.close();
        }
        catch (IOException e){
            System.out.println("Error handling file/No file exists, please enter some scouting data.");
        }
        
        catch (ClassNotFoundException e){
            this.scoutRobots = new ArrayList<ScoutedRobot>();
        }
    }
    
    @Override
    public String toString(){
        String strResult = "Tournament Robots:\n";
        
        for (ScoutedRobot robot: this.scoutRobots){
            strResult += robot.toString() + "\n";
        }
        
        return strResult;
    }
    
    //getters and setters
    public ArrayList<ScoutedRobot> getRobots(){
        return this.scoutRobots;
    }
    
    public short getRobotCount(){
        return (short) this.scoutRobots.size();
    }
    
    public short getMatchCount(){
        return this.shrMatchCount;
    }
}
