
/**
 * A match with 2 alliances, checks for who the winner will be based on scouting data
 *
 * @author Sean Nie
 * @version 2026-06-08
 */
public class Match
{
    //instance variables
    private Alliance redAlliance;
    private Alliance blueAlliance;
    private byte bytMatchNumber;
    
    //constructor
    public Match(Alliance redAlliance, Alliance blueAlliance, byte bytMatchNumber){
        this.redAlliance = redAlliance;
        this.blueAlliance = blueAlliance;
        this.bytMatchNumber = bytMatchNumber;
    }
    
    //get the winning alliance
    public Alliance getMatchWinner(){
        //the winning alliance is the one who gets mroe points
        //maybe consider a tie, but this is very rare
        //for now, default to the red alliance as the winner if tie
        if (this.redAlliance.calculateTotalScore() >= this.blueAlliance.calculateTotalScore()){
            return this.redAlliance;
        }
        else {
            return this.blueAlliance;
        }
    }
    
    //get the summary of the game
    //this method will be used for the match predictor
    public String getGameSummary(){
        short shrRedScore = this.redAlliance.calculateTotalScore();
        short shrBlueScore = this.blueAlliance.calculateTotalScore();
        String strWinner;
        //use a local strWinner variable because we dont want to change 
        //the state of the match object
        if (shrRedScore >= shrBlueScore){
            strWinner = "Red";
        }
        else {
            strWinner = "Blue";
        }
        return "Match " + this.bytMatchNumber + " | Red: " + shrRedScore + " | Blue: " + shrBlueScore + " | Predicted Winner: " + strWinner;
    }

    //Getters and Setters
    public Alliance getRedAlliance(){
        return this.redAlliance;
    }

    public Alliance getBlueAlliance(){
        return this.blueAlliance;
    }

    public byte getMatchNumber(){
        return this.bytMatchNumber;
    }

    public void setRedAlliance(Alliance redAlliance){
        this.redAlliance = redAlliance;
    }

    public void setBlueAlliance(Alliance blueAlliance){
        this.blueAlliance = blueAlliance;
    }

    public void setMatchNumber(byte bytMatchNumber){
        this.bytMatchNumber = bytMatchNumber;
    }
}
