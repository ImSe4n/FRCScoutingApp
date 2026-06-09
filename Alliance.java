
/**
 * A competitive match alliance consisting of up to three robots
 *
 * @author Sean Nie
 * @version 2026-06-08
 */

//array list for each alliance of robots
import java.util.ArrayList;

public class Alliance
{
    //instance variables
    private short shrTotalClimbPoints;
    private byte bytTotalPenalties;
    
    //static because we want to keep track of the total number of alliances across all instances of the class
    private static short shrNumAlliances = 0;
    
    //array lis to store robots in an alliance
    private ArrayList<Robot> robots;
    
    //main constructor
    //initializes an alliance using three unique robots
    public Alliance(Robot robo1, Robot robo2, Robot robo3){
        this.robots = new ArrayList<Robot>();
        this.robots.add(robo1);
        this.robots.add(robo2);
        this.robots.add(robo3);
        Alliance.shrNumAlliances++;
        this.updateAllianceStats();
    }
    
    //overloaded constructor
    //initializes an alliance using a pre-existing list of robots
    public Alliance(ArrayList<Robot> robots){
        this.robots = new ArrayList<Robot>(robots);
        Alliance.shrNumAlliances++;
        this.updateAllianceStats();
    }
    
    //calculate the score of an alliance
    //by adding the score of each individual robot
    public short calculateTotalScore(){
        short totalAllianceScore = 0;
        
        //loop through an alliances and get the score of each robot
        //then add to totalAllianceScore
        for(Robot robot: this.robots){
            totalAllianceScore += robot.getIndividualScore();
        }

        return totalAllianceScore;
    }
    
    //check if an alliance has more than 3 robots
    public boolean boolIsAllianceFull(){
        if (this.robots.size() >= 3){
            return true;
        }
        else {
            return false;
        }
    }
    
    //add a robot to the alliance
    public void addRobot(Robot robot){
        if (this.boolIsAllianceFull() == false){
            this.robots.add(robot);
            this.updateAllianceStats();
        }
    }
    
    //update the stats of an alliance for each new robot added to the alliance
    //sort of like a constructor
    //since robots inside of an alliance may come with existing penalties and climb levels we need to find a way to update the alliance stats
    private void updateAllianceStats(){
        this.shrTotalClimbPoints = 0;
        this.bytTotalPenalties = 0;
        
        //loop through the array of robots
        for(Robot robot: this.robots){
            //set the total climb points of the alliance based on the climb points from the robots
            this.shrTotalClimbPoints += robot.getClimbLevel() * 10;
            
            //if the robot is a ScoutedRobot, then first cast the element then add the number of penalties from the scouted robot to the total penalties
            if (robot instanceof ScoutedRobot){
                ScoutedRobot scoutedRobot = (ScoutedRobot) robot;

                this.bytTotalPenalties += scoutedRobot.getMinorPenalties() + scoutedRobot.getMajorPenalties();
            }
        }
    }

    //Getters and Setters
    public ArrayList<Robot> getRobots(){
        return this.robots;
    }

    public short getTotalClimbPoints(){
        return this.shrTotalClimbPoints;
    }

    public byte getTotalPenalties(){
        return this.bytTotalPenalties;
    }
    
    public static short getAllianceCount(){
        return Alliance.shrNumAlliances;
    }
}
