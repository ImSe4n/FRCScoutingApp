
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
    private ArrayList<ScoutedRobot> robots;
    private String strTournamentName;

    public Tournament(String strTournamentName){
        this.robots = new ArrayList<ScoutedRobot>();
        this.strTournamentName = strTournamentName;
    }

    public void addMatchObservation(short shrTeamNumber, short shrAutoFuelCount, short shrTeleFuelCount, short shrEndFuelCount, int bytClimbLevel, byte bytDefenceTime, byte bytMinorPenalties, byte bytMajorPenalties, byte bytDriverRating, byte bytAccuracyRating, String strNotes){
        ScoutedRobot existingRobot = this.findByTeamNumber(shrTeamNumber);
        if (existingRobot != null){
            existingRobot.addMatchObservation(shrAutoFuelCount, shrTeleFuelCount, shrEndFuelCount, bytClimbLevel, bytDefenceTime, bytMinorPenalties, bytMajorPenalties, bytDriverRating, bytAccuracyRating);
        }
        else {
            ScoutedRobot newRobot = new ScoutedRobot(shrTeamNumber, shrAutoFuelCount, shrTeleFuelCount, shrEndFuelCount, (byte) bytClimbLevel, bytDefenceTime, bytMinorPenalties, bytMajorPenalties, bytDriverRating, bytAccuracyRating, strNotes);
            this.robots.add(newRobot);
        }
    }

    public ScoutedRobot findByTeamNumber(short shrTeamNumber){
        for (ScoutedRobot robot : this.robots){
            if (robot.getTeamNumber() == shrTeamNumber){
                return robot;
            }
        }
        return null;
    }

    public void sortByScore(){
        int intSize = this.robots.size();
        for (int i = 0; i < intSize - 1; i++){
            for (int j = 0; j < intSize - 1 - i; j++){
                if (this.robots.get(j).getIndividualScore() < this.robots.get(j + 1).getIndividualScore()){
                    ScoutedRobot temp = this.robots.get(j);
                    this.robots.set(j, this.robots.get(j + 1));
                    this.robots.set(j + 1, temp);
                }
            }
        }
    }

    public void sortByTeamNumber(){
        int intSize = this.robots.size();
        for (int i = 0; i < intSize - 1; i++){
            for (int j = 0; j < intSize - 1 - i; j++){
                if (this.robots.get(j).getTeamNumber() > this.robots.get(j + 1).getTeamNumber()){
                    ScoutedRobot temp = this.robots.get(j);
                    this.robots.set(j, this.robots.get(j + 1));
                    this.robots.set(j + 1, temp);
                }
            }
        }
    }

    public void saveToFile(String strFileName) throws IOException{
        ObjectOutputStream fileWriter = new ObjectOutputStream(new FileOutputStream(strFileName));
        fileWriter.writeObject(this.robots);
        fileWriter.close();
    }

    public void loadFromFile(String strFileName) throws IOException{
        ObjectInputStream fileReader = new ObjectInputStream(new FileInputStream(strFileName));
        try {
            this.robots = (ArrayList<ScoutedRobot>) fileReader.readObject();
        }
        catch (ClassNotFoundException e){
            this.robots = new ArrayList<ScoutedRobot>();
        }
        fileReader.close();
    }

    @Override
    public String toString(){
        String strResult = "Tournament: " + this.strTournamentName + "\n";
        for (ScoutedRobot robot : this.robots){
            strResult += robot.toString() + "\n";
        }
        return strResult;
    }

    //Getters and Setters
    public int getRobotCount(){
        return this.robots.size();
    }

    public ArrayList<ScoutedRobot> getRobots(){
        return this.robots;
    }

    public String getTournamentName(){
        return this.strTournamentName;
    }

    public void setTournamentName(String strTournamentName){
        this.strTournamentName = strTournamentName;
    }
}
