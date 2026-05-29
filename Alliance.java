
/**
 * Write a description of class Alliance here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */

import java.util.ArrayList;

public class Alliance
{
    private short shrTotalClimbPoints;
    private byte bytTotalPenalties;
    
    private static short shrNumAlliances = 0;
    
    private ArrayList<Robot> robots;
    
    public Alliance(Robot robo1, Robot robo2, Robot robo3){
        robots = new ArrayList<Robot>();
        robots.add(robo1);
        robots.add(robo2);
        robots.add(robo3);
        shrNumAlliances++;
        updateAggregateStats();
    }
    
    public Alliance(ArrayList<Robot> robots){
        this.robots = new ArrayList<Robot>(robots);
        shrNumAlliances++;
        updateAggregateStats();
    }

    public short calculateTotalScore(){
        short totalAllianceScore = 0;
        
        for(Robot robot: robots){
            totalAllianceScore += robot.getIndividualScore();
        }
        
        return totalAllianceScore;
    }
    
    public boolean boolIsAllianceFull(){
        if (robots.size() >= 3){
            return true;
        }
        else {
            return false;
        }
    }
    
    public void addRobot(Robot robot){
        if (this.boolIsAllianceFull() == false){
            robots.add(robot);
            updateAggregateStats();
        }
    }
    
    public static short getNumAlliances(){
        return shrNumAlliances;
    }
    
    private void updateAggregateStats(){
        this.shrTotalClimbPoints = 0;
        this.bytTotalPenalties = 0;
        
        for(Robot robot: robots){
            shrTotalClimbPoints += robot.getClimbLevel() * 10;
            
            if (robot instanceof ScoutedRobot){
                ScoutedRobot scoutedRobot = (ScoutedRobot) robot;
                
                bytTotalPenalties += scoutedRobot.getMinorPenalties() + scoutedRobot.getMajorPenalties();
            }
        }
    }
    
    //Getters and Setters
    public ArrayList<Robot> getRobots(){
        return robots;
    }
    
    public short getTotalClimbPoints(){
        return this.shrTotalClimbPoints;
    }
    
    public byte getTotalPenalties(){
        return this.bytTotalPenalties;
    }
}