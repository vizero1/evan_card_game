using System;
using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class GameHandler : MonoSingleton<GameHandler>
{
    public enum RequestType
    {
        None,
        CreateGame,
        JoinGame,
        Status,
        MakeMove
    }

    public string PlayerId { get; private set; }
    public string GameId { get; private set; }
    public bool NeedStatus { get; private set; }
    public bool HasOpponent { get; private set; }
    public bool MyTurn { get; private set; }
    public CardDto CurrentCard { get; private set; }
    private int _statusRequestInterval = 5;
    private string HardcodedGameId = "0xaB3536A255B601CbeBF70519AC003653a9CF4CD3";
    public Text GameIdText;

    private string GetGameId()
    {
        return HardcodedGameId != "" ? HardcodedGameId : GameId;
    }

    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
        Updater.Instance.OnUpdate += DoUpdate;
    }

    protected override void OnDestroy()
    {
        Events.Instance.OnGameplayStatusChange -= GameplayStatusChange;
        Updater.Instance.OnUpdate -= DoUpdate;
    }

    void DoUpdate()
    {
    }

    public void MakeMove(string attribute)
    {
        StartCoroutine(RequestMakeMove(attribute));
    }

    public void DoRequest(RequestType type)
    {
        switch (type)
        {
            case RequestType.CreateGame:
                StartCoroutine(RequestCreateGame());
                break;
            case RequestType.JoinGame:
                StartCoroutine(RequestJoinGame());
                break;
            case RequestType.Status:
                StartCoroutine(RequestStatus());
                break;
        }
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {
        switch (newMatchStatus)
        {
            case GameplayStatus.GameRunning:
                break;
            case GameplayStatus.OpenCard:
                break;
        }
    }

    private IEnumerator RequestCreateGame()
    {
        var url = Config.Instance.Url + "/game?playerName=Player1";
        var www = UnityWebRequest.Post(url, "");
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.LogError(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log("CreateGame Reponse: " + data);
            var dto = JsonUtility.FromJson<CreateGameDto>(data);
            if (!String.IsNullOrEmpty(HardcodedGameId))
            {
                GameId = HardcodedGameId;
            }
            else
            {
                GameId = dto.gameId;
            }
            GameIdText.text = "Game ID: " + HardcodedGameId;
            PlayerId = dto.playerId;
            CreateJoinGameSuccessful();
        }
    }

    private IEnumerator RequestJoinGame()
    {
        var url = Config.Instance.Url + "/join/" + HardcodedGameId + "?playerName=Player2";
        var www = UnityWebRequest.Post(url, "");
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.LogError(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log("JoinGame Reponse: " + data);
            var dto = JsonUtility.FromJson<CreateGameDto>(data);
            GameIdText.text = "Game ID: " + HardcodedGameId;
            PlayerId = dto.playerId;
            CreateJoinGameSuccessful();
        }
    }

    private void CreateJoinGameSuccessful()
    {
        NeedStatus = true;
        UIManager.Instance.Switch(Layer.Main, UIAction.Hide, 0);
        UIManager.Instance.Switch(Layer.Ingame, UIAction.Show, 0);
        Events.Instance.GameplayStatus = GameplayStatus.GameRunning;
        DoRequest(RequestType.Status);
    }

    private IEnumerator RequestMakeMove(string attribute)
    {
        var url = Config.Instance.Url + "/move/" + GetGameId() + "?playerId=" + PlayerId + "&attribute=" + attribute;
        var formData = new List<IMultipartFormSection>();

        var www = UnityWebRequest.Post(url, formData);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.LogError(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log("MakeMove Reponse: " + data);
            var dto = JsonUtility.FromJson<MakeMoveDto>(data);
            var hasWon = dto.hasWon;

            if (hasWon == "true")
            {
                Events.Instance.GameplayStatus = GameplayStatus.YouWon;
            }
            else
            {
                Events.Instance.GameplayStatus = GameplayStatus.YouLost;
            }

            NeedStatus = true;
            Events.Instance.GameplayStatus = GameplayStatus.GameRunning;

            DoRequest(RequestType.Status);
        }
    }

    private IEnumerator RequestStatus()
    {
        Debug.Log("Run Request GetStatus");
        var url = Config.Instance.Url + "/status/" + GetGameId() + "?playerId=" + PlayerId;
        var www = UnityWebRequest.Get(url);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.Log(www.error);
            
             yield return new WaitForSeconds(this._statusRequestInterval);
            DoRequest(RequestType.Status);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log("GetStatus Reponse: " + data);
            var dto = JsonUtility.FromJson<StatusDto>(data);

            var hasChanged = false;
            var needTimeout = false;
            if (dto.hasOpponent)
            {
                if (HasOpponent == false)
                {
                    HasOpponent = true;
                    hasChanged = true;
                    MyTurn = dto.myTurn;
                    Events.Instance.GameplayStatus = GameplayStatus.OpponentReady;
                    if (!MyTurn)
                    {
                        NeedStatus = true;
                    }
                }
                else
                {

                    var cardHasChanged = dto.card.Id != CurrentCard.Id;
                    if (!MyTurn && cardHasChanged)
                    {
                        var hasWon = dto.myTurn;
                        if (hasWon)
                        {
                            Events.Instance.GameplayStatus = GameplayStatus.YouWon;
                        }
                        else
                        {
                            Events.Instance.GameplayStatus = GameplayStatus.YouLost;
                        }
                        needTimeout = true;
                        hasChanged = true;
                    }
                    else if (cardHasChanged)
                    {
                        hasChanged = true;
                    }


                    if (!MyTurn && dto.myTurn)
                    {
                        MyTurn = dto.myTurn;
                        hasChanged = true;
                    }
                    if (MyTurn && !dto.myTurn)
                    {
                        MyTurn = dto.myTurn;
                        hasChanged = true;
                    }

                }
                CurrentCard = dto.card;

                if (hasChanged)
                {
                    var timeout = needTimeout ? 2.0f : 0;
                    Timer.Instance.Add(timeout, () =>
                    {
                        if (MyTurn)
                        {
                            Events.Instance.GameplayStatus = GameplayStatus.YourTurn;
                        }
                        else
                        {
                            Events.Instance.GameplayStatus = GameplayStatus.OpponentTurn;
                        }
                        Timer.Instance.Add(1.0f, () =>
                        {
                            Events.Instance.GameplayStatus = GameplayStatus.GetCard;

                            Timer.Instance.Add(2.0f, () =>
                            {
                                Events.Instance.GameplayStatus = GameplayStatus.OpenCard;
                            });
                        });
                    });

                }
            }

            if (!hasChanged || !MyTurn)
            {
                yield return new WaitForSeconds(this._statusRequestInterval);
                DoRequest(RequestType.Status);
            }
        }
    }

}
